# Mofas-Kitchen-Buddy
Submission to KUET bitfest Hackathon 2025 by Team Escalator.

## API Documentation

- Route: /ingredients/:UserID  
  Method: GET  
  Sample Response:  
  ```json
  [
    {
      "id": 1,
      "name": "Sugar",
      "quantity": 2.5,
      "unit": "kg",
      "last_updated": "2024-12-20 12:00:00"
    },
    {
      "id": 2,
      "name": "Flour",
      "quantity": 1.0,
      "unit": "kg",
      "last_updated": "2024-12-19 18:30:00"
    }
  ]
  ```



- Route: /ingredients/add  
  Method: POST  
  Sample Payload:  
  ```json
  {
    "name": "Sugar",
    "quantity": 1.5,
    "unit": "kg",
    "token": "dsfsf"
  }
  ```  
  Sample Response:  
  ```json
  {
    "message": "Ingredient updated successfully",
    "ingredient_id": 1
  }
  ```

- Route: /confirm  
  Method: POST  
  Sample Payload:  
  ```json
  {
    "token": "securepassword"
  }
  ``` 

- Route: /signup  
  Method: POST  
  Sample Payload:  
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "securepassword"
  }
  ```  
  Sample Response:  
  ```json
  {
    "message": "User registered successfully",
    "user_id": 101
  }
  ```

- Route: /login  
  Method: POST  
  Sample Payload:  
  ```json
  {
    "email": "johndoe@example.com",
    "password": "securepassword"
  }
  ```  
  Sample Response:  
  ```json
  {
    "message": "Login successful",
    "token": "abcdef123456"
  }
  ```



- Route: /recipes/:UserID  
  Method: GET  
  Sample Response:  
  ```json
  [
    {
      "id": 1,
      "name": "Chocolate Cake",
      "ingredients": {
        "Sugar": "200g",
        "Flour": "300g",
        "Cocoa Powder": "100g"
      },
      "instructions": "Mix ingredients, bake at 180°C for 30 minutes.",
      "taste": "Sweet",
      "cuisine_type": "Dessert",
      "prep_time": 45
    },
    {
      "id": 2,
      "name": "Pasta Carbonara",
      "ingredients": {
        "Pasta": "250g",
        "Eggs": "2",
        "Cheese": "50g",
        "Bacon": "100g"
      },
      "instructions": "Boil pasta, mix with eggs, cheese, and bacon.",
      "taste": "Savory",
      "cuisine_type": "Italian",
      "prep_time": 30
    }
  ]
  ```



- Route: /recipes/add  
  Method: POST  
  Sample Payload:  
  ```json
  {
    "text" : "recipes text",
    "token": "dsfsf"
  }
  ```  
  Sample Response:  
  ```json
  {
    "message": "Recipe added successfully",
    "recipe_id": 1
  }
  ```



- Route: /recipes/daily/:UserID  
  Method: GET  
  Sample Response:
  ```json
  {
    "id": 1,
    "name": "Chocolate Cake",
    "ingredients": {
      "Sugar": "200g",
      "Flour": "300g",
      "Cocoa Powder": "100g"
    },
    "instructions": "Mix ingredients, bake at 180°C for 30 minutes.",
    "taste": "Sweet",
    "cuisine_type": "Dessert",
    "prep_time": 45
  }
  ```

 
