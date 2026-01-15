import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const CreateLoginSchema = z.object({
  employeeId: z.string().uuid({ message: 'Invalid employee ID format' }),
  email: z.string().email({ message: 'Invalid email format' }).max(255, { message: 'Email too long' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(128, { message: 'Password too long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  firstName: z.string().max(100, { message: 'First name too long' }).regex(/^[a-zA-Z\s'-]+$/, { message: 'First name contains invalid characters' }).optional(),
  lastName: z.string().max(100, { message: 'Last name too long' }).regex(/^[a-zA-Z\s'-]+$/, { message: 'Last name contains invalid characters' }).optional(),
})

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create admin client for user creation
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get the authorization header to verify the caller
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a client with the user's token to verify their role
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get the current user
    const { data: { user: callerUser }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !callerUser) {
      console.error('Failed to get caller user:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Caller user ID:', callerUser.id)

    // Check if caller has HR or Admin role by querying user_roles table directly
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .in('role', ['hr', 'admin'])
      .limit(1)
      .maybeSingle()

    if (roleError) {
      console.error('Error checking role:', roleError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!roleData) {
      console.error('User does not have required role')
      return new Response(
        JSON.stringify({ error: 'Forbidden: HR or Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse and validate request body
    let body: z.infer<typeof CreateLoginSchema>;
    try {
      const rawBody = await req.json()
      body = CreateLoginSchema.parse(rawBody)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map(e => e.message).join(', ')
        return new Response(
          JSON.stringify({ error: message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { employeeId, email, password, firstName, lastName } = body

    console.log('Creating login for employee:', employeeId, 'with email:', email)

    // Check if employee already has a user account linked (single source of truth: employees.user_id)
    const { data: existingEmployee, error: employeeCheckError } = await supabaseAdmin
      .from('employees')
      .select('user_id')
      .eq('id', employeeId)
      .single()

    if (employeeCheckError) {
      console.error('Error checking employee:', employeeCheckError)
      return new Response(
        JSON.stringify({ error: 'Employee not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingEmployee?.user_id) {
      return new Response(
        JSON.stringify({ error: 'This employee already has a login account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create the auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since HR is creating the account
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User created with ID:', newUser.user.id)

    // Link the employee to the user (single source of truth: employees.user_id)
    const { error: updateError } = await supabaseAdmin
      .from('employees')
      .update({ user_id: newUser.user.id })
      .eq('id', employeeId)

    if (updateError) {
      console.error('Error linking employee to user:', updateError)
      // Try to clean up the created user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return new Response(
        JSON.stringify({ error: 'Failed to link account to employee' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully created login for employee:', employeeId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUser.user.id,
        message: 'Login created successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
