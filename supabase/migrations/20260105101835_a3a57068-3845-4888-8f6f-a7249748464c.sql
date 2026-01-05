-- Phase 1: Core Foundation Database Schema

-- ============================================
-- 1. CREATE ENUM TYPES
-- ============================================

-- Application roles enum
CREATE TYPE public.app_role AS ENUM ('employee', 'manager', 'hr', 'admin');

-- Employee status enum
CREATE TYPE public.employee_status AS ENUM ('active', 'on_leave', 'on_boarding', 'probation', 'terminated');

-- Gender enum
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- Departments table
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Positions table
CREATE TABLE public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL UNIQUE,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  level integer DEFAULT 1 CHECK (level >= 1 AND level <= 10),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Employees table
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_code text UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  avatar_url text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  position_id uuid REFERENCES public.positions(id) ON DELETE SET NULL,
  manager_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  status public.employee_status NOT NULL DEFAULT 'active',
  join_date date,
  location text,
  salary numeric(12, 2),
  address text,
  date_of_birth date,
  gender public.gender_type,
  nationality text,
  emergency_contact_name text,
  emergency_contact_relationship text,
  emergency_contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Profiles table (links to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  first_name text,
  last_name text,
  avatar_url text,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (user_id, role)
);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE SECURITY DEFINER FUNCTIONS
-- ============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles public.app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- Get the employee ID for a user
CREATE OR REPLACE FUNCTION public.get_user_employee_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT employee_id FROM public.profiles WHERE id = _user_id
$$;

-- Check if user is the manager of an employee
CREATE OR REPLACE FUNCTION public.is_manager_of(_manager_user_id uuid, _employee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees e
    JOIN public.profiles p ON p.employee_id = e.manager_id
    WHERE e.id = _employee_id
      AND p.id = _manager_user_id
  )
$$;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================

-- Departments policies (all authenticated can view, HR/Admin can modify)
CREATE POLICY "Authenticated users can view departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "HR and Admin can insert departments"
  ON public.departments FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "HR and Admin can update departments"
  ON public.departments FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "HR and Admin can delete departments"
  ON public.departments FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

-- Positions policies (all authenticated can view, HR/Admin can modify)
CREATE POLICY "Authenticated users can view positions"
  ON public.positions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "HR and Admin can insert positions"
  ON public.positions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "HR and Admin can update positions"
  ON public.positions FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "HR and Admin can delete positions"
  ON public.positions FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

-- Employees policies
CREATE POLICY "Users can view own employee record"
  ON public.employees FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Managers can view their reports"
  ON public.employees FOR SELECT
  TO authenticated
  USING (public.is_manager_of(auth.uid(), id));

CREATE POLICY "HR and Admin can view all employees"
  ON public.employees FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "HR and Admin can insert employees"
  ON public.employees FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "HR and Admin can update employees"
  ON public.employees FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "HR and Admin can delete employees"
  ON public.employees FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "HR and Admin can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "HR and Admin can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 6. CREATE TRIGGERS
-- ============================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to employees table
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile and assign default role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Assign default 'employee' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. SEED INITIAL DATA
-- ============================================

-- Insert departments
INSERT INTO public.departments (name, description) VALUES
  ('Executive', 'Executive leadership team'),
  ('Engineering', 'Software development and technical operations'),
  ('Design', 'UI/UX and product design'),
  ('Marketing', 'Marketing and communications'),
  ('Finance', 'Financial planning and accounting'),
  ('Human Resources', 'HR and talent management'),
  ('Sales', 'Sales and business development');

-- Insert positions with department links
INSERT INTO public.positions (title, department_id, level) VALUES
  ('CEO', (SELECT id FROM public.departments WHERE name = 'Executive'), 10),
  ('VP Engineering', (SELECT id FROM public.departments WHERE name = 'Engineering'), 9),
  ('VP Commercial', (SELECT id FROM public.departments WHERE name = 'Sales'), 9),
  ('VP Finance', (SELECT id FROM public.departments WHERE name = 'Finance'), 9),
  ('Engineering Manager', (SELECT id FROM public.departments WHERE name = 'Engineering'), 7),
  ('Senior Developer', (SELECT id FROM public.departments WHERE name = 'Engineering'), 6),
  ('Backend Developer', (SELECT id FROM public.departments WHERE name = 'Engineering'), 5),
  ('Frontend Developer', (SELECT id FROM public.departments WHERE name = 'Engineering'), 5),
  ('Junior Developer', (SELECT id FROM public.departments WHERE name = 'Engineering'), 3),
  ('Design Director', (SELECT id FROM public.departments WHERE name = 'Design'), 8),
  ('UI/UX Designer', (SELECT id FROM public.departments WHERE name = 'Design'), 5),
  ('Marketing Director', (SELECT id FROM public.departments WHERE name = 'Marketing'), 8),
  ('Marketing Specialist', (SELECT id FROM public.departments WHERE name = 'Marketing'), 4),
  ('Financial Analyst', (SELECT id FROM public.departments WHERE name = 'Finance'), 5),
  ('HR Director', (SELECT id FROM public.departments WHERE name = 'Human Resources'), 8),
  ('HR Manager', (SELECT id FROM public.departments WHERE name = 'Human Resources'), 6),
  ('Sales Representative', (SELECT id FROM public.departments WHERE name = 'Sales'), 4);

-- Create indexes for better performance
CREATE INDEX idx_employees_department ON public.employees(department_id);
CREATE INDEX idx_employees_position ON public.employees(position_id);
CREATE INDEX idx_employees_manager ON public.employees(manager_id);
CREATE INDEX idx_employees_user ON public.employees(user_id);
CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_positions_department ON public.positions(department_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_profiles_employee ON public.profiles(employee_id);