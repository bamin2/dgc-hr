import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Parse request body
    const { employeeId, email, password, firstName, lastName } = await req.json()

    if (!employeeId || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: employeeId, email, password' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate password
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating login for employee:', employeeId, 'with email:', email)

    // Check if employee already has a user account linked
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('employee_id', employeeId)
      .maybeSingle()

    if (profileError) {
      console.error('Error checking existing profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to check existing account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingProfile) {
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

    // Link the profile to the employee
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ employee_id: employeeId })
      .eq('id', newUser.user.id)

    if (updateError) {
      console.error('Error linking profile to employee:', updateError)
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
