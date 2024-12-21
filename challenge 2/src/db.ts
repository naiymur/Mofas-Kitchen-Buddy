export interface DatabaseSchema {
    recipes: {
      id: number;
      name: string;
      instructions: string;
      taste: string;
      cuisine_type: string;
      prep_time: number;
      created_by: number;
    };
    ingredients: {
      id: number;
      name: string;
      quantity: string;
      recipe_id: number;
    };
  }
  