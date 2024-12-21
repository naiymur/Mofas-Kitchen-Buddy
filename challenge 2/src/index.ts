import { Router } from 'itty-router';
import {supabase} from './supabaseClient';

const router = Router();

// Helper to parse JSON body
async function parseJson(request: Request): Promise<any> {
  try {
    const body = await request.json();
    return body;
  } catch {
    return {};
  }
}

// Middleware to validate JWT

async function validateToken(request: Request): Promise<any> {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
      return { error: 'Unauthorized' };
    }
  
    // Verify the token using Supabase
    const { data: user, error } = await supabase.auth.getUser(token);
  
    if (error || !user) {
      return { error: 'Invalid or expired token' };
    }
  
    return { user };
  }

// Routes

// Signup
router.post('/signup', async (request) => {
  const { email, password, username } = await parseJson(request);

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
  }

  // Use Supabase Auth to sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Signup failed' }),
      { status: 400 }
    );
  }

  // Optionally insert additional profile data (e.g., username) into the 'users' table
  if (username) {
    const { error: profileError } = await supabase
      .from('users')
      .update({ username })
      .eq('id', data.user.id);

    if (profileError) {
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400 }
      );
    }
  }

  return new Response(
    JSON.stringify({
      message: 'User registered successfully',
      user_id: data.user,
    }),
    { status: 201 }
  );
});

  

// Login

router.post('/login', async (request) => {
    const { email, password } = await parseJson(request);
  
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
    }
  
    // Use Supabase Auth to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error || !data.session) {
      return new Response(
        JSON.stringify({ error: error?.message || 'Login failed' }),
        { status: 400 }
      );
    }
  
    // Return session token and user info
    return new Response(
      JSON.stringify({
        message: "Login successful",
        token: data.session.access_token
      }),
      { status: 200 }
    );
  });

// Get Ingredients
router.post('/ingredients', async (request) => {
  const { user, error } = await validateToken(request);
  if (error) return new Response(JSON.stringify({ error }), { status: 401 });

  const { data, error: dbError } = await supabase.from('ingredients').select('*').eq('user_id', user.id);

  if (dbError) {
    return new Response(JSON.stringify({ error: dbError.message }), { status: 400 });
  }
  return new Response(JSON.stringify(data));
});

router.post('/ingredients/add', async (request) => {
    const { user, error: authError } = await validateToken(request);
    if (authError) {
      return new Response(JSON.stringify({ error: authError }), { status: 401 });
    }
  
    const { name, quantity, unit } = await parseJson(request);
  
    if (!name || !quantity || !unit) {
      return new Response(JSON.stringify({ error: 'Invalid input. Name, quantity, and unit are required.' }), { status: 400 });
    }
  
    const { data, error: dbError } = await supabase
      .from('ingredients')
      .insert([{ name, quantity, unit, user_id: user.id }])
      .select();
  
    if (dbError || !data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: dbError?.message || 'Failed to add ingredient' }),
        { status: 400 }
      );
    }
  
    return new Response(
      JSON.stringify({ message: 'Ingredient added successfully', ingredient_id: data[0].id }),
      { status: 201 }
    );
  });
  

// Get Recipes
router.get('/recipes', async () => {
    const { data, error } = await supabase.from('recipes').select('*');
  
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(JSON.stringify(data));
  });


async function parseRecipeTextToJson(plainText: string): Promise<any> {
  const apiKey = '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'; // Replace with your OpenAI API key

  const prompt = `
Extract the following details from the plain text recipe into a JSON format:
1. Name of the recipe
2. Ingredients (list of objects with 'name' and 'quantity' keys)
3. Instructions (step-by-step as a string)
4. Taste
5. Cuisine Type
6. Preparation Time (in minutes)

Plain Text Recipe:
${plainText}

JSON Format:
`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free', // You can use "gpt-4" if available
        prompt,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Error: ${errorText}`);
    }

    const result = await response.json();
    const recipeJson = JSON.parse(result.choices[0].text.trim());
    return recipeJson;
  } catch (error) {
    console.error('Error parsing recipe text:', error);
    throw new Error('Failed to parse recipe text into JSON.');
  }
}


// Add Recipe
// Define types for Supabase response
type RecipeData = {
    id: number;
    name: string;
    instructions: string;
    taste: string;
    cuisine_type: string;
    prep_time: number;
    created_by: number;
  };
  
  type Ingredient = {
    name: string;
    quantity: string;
  };
  
  // Add Recipe
router.post('/recipes/add', async (request) => {
  const { user, error } = await validateToken(request);
  if (error) return new Response(JSON.stringify({ error }), { status: 401 });

  const { text } = await parseJson(request);
  if (!text) {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
  }

  try {
    // Parse plain text into JSON
    const recipe = await parseRecipeTextToJson(text);

    const { name, instructions, taste, cuisine_type, prep_time, ingredients } = recipe;

    // Validate required fields
    if (!name || !instructions || !ingredients || !Array.isArray(ingredients)) {
      return new Response(JSON.stringify({ error: 'Invalid recipe data' }), { status: 400 });
    }

    // Insert recipe into database
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert([{ name, instructions, taste, cuisine_type, prep_time, created_by: user.id }])
      .select();

    if (recipeError || !recipeData || recipeData.length === 0) {
      return new Response(JSON.stringify({ error: recipeError?.message || 'Failed to add recipe' }), { status: 400 });
    }

    const recipeId = recipeData[0].id;

    // Insert ingredients into the database
    const ingredientEntries = ingredients.map((ingredient: { name: string; quantity: string }) => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      recipe_id: recipeId,
    }));

    const { error: ingredientError } = await supabase.from('ingredients').insert(ingredientEntries);

    if (ingredientError) {
      return new Response(JSON.stringify({ error: ingredientError.message }), { status: 400 });
    }

    return new Response(
      JSON.stringify({ message: 'Recipe added successfully', recipe_id: recipeId }),
      { status: 201 }
    );
  } catch (error) {
    return new Response( "error: error.message" , { status: 500 });
  }
});

// Get Daily Recipe
router.get('/recipes/daily/:userId', async (request) => {
  const { userId } = request.params;

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
  return new Response(JSON.stringify(data[0]));
});

// Default route
router.all('*', () => new Response('Not Found', { status: 404 }));

// Worker handler
export default {
  fetch: (request: Request) => router.handle(request),
};
