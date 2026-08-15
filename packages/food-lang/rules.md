# 🍳 .food Recipe Language Guide

## 📦 Core Objects

The `.food` language has exactly **two object types**:

- 🥕 **Ingredients** - Food items with quantities
- 🔧 **Utensils** - Cooking tools with methods

### Object Initialization
All objects use the `new` keyword with constructors:
```food
emmental = new Emmental("200g, grated")  // Ingredient with amount
knife = new Knife()                      // Utensil
```
**⚠️ Important:** All measurements must be in metric units.

---

## 🥕 Ingredients
- Objects representing food items
- **No properties or methods**
- Must include quantity information in constructor
- Examples: `flour = new Flour("500g")`, `eggs = new Eggs("3 large")`

---

## 🔧 Utensils  
- Objects representing cooking tools
- **Have methods for actions**
- Examples: `pot = new Pot()`, `oven = new Oven()`

---

## ⚡ Actions

Actions represent cooking steps and come in two forms:

### 🔨 Methods (Preferred)
Actions performed **on utensils**:
```food
pot.boil()
pan.fry(chicken)
oven.bake("180°C, 25 minutes")
```

### 🛠️ Built-in Functions (When Necessary)
Actions that don't fit specific utensils:
```food
wait("10 minutes")
transfer(pan, pot)
rinse(vegetables, "cold water")
```

**💡 Rule:** Use methods whenever possible. Only use functions when the action doesn't logically belong to a utensil.

---

## 📝 Code Style Rules

| Element | Style | Example |
|---------|-------|---------|
| Variables | `snake_case` | `ground_beef`, `red_pepper` |
| Constructors | `camelCase` | `GroundBeef()`, `RedPepper()` |
| Functions/Methods | `camelCase` | `cook()`, `boil()`, `transfer()` |
| Main Function | Always `cook()` | `fn cook() { ... }` |

**⚠️ Critical:** All functions and methods must be defined in `tokens.json` for syntax highlighting.

### 📐 Long Function Call Formatting

When function calls become long, split them across multiple lines:

✅ **Correct formatting:**
```food
dough = rolling_pin.roll(mixing_bowl,
                        "large sheet on baking sheet")
```

❌ **Avoid:**
```food
dough = rolling_pin.roll(
    mixing_bowl,
    "large sheet on baking sheet"
)
```

**Rules:**
- Keep the **first argument** on the same line as the function
- **Align subsequent arguments** under the first argument
- **Closing parenthesis** stays with the last argument (no separate line)

---

## 📋 File Structure Requirements

Every `.food` file **must** follow this exact structure:

### 1️⃣ Filename Comment
```food
//recipe_name.food
```

### 2️⃣ Ingredient Declarations
```food
// Ingredients
flour = new Flour("500g")
eggs = new Eggs("2 large")
```

### 3️⃣ Utensil Declarations  
```food
// Utensils
mixing_bowl = new MixingBowl()
oven = new Oven()
```

### 4️⃣ Helper Functions (Optional)
```food
fn prepareIngredients() {
    // Prep work here
}
```

### 5️⃣ Main cook() Function
```food
fn cook() {
    // Recipe logic
    return "Recipe Name"
}
```

### 6️⃣ Return Statement
The `cook()` function **must** return the recipe name as a string.

### 📄 Complete Example
```food
//chocolate_chip_cookies.food

// Ingredients
flour = new Flour("2 cups")
sugar = new Sugar("1 cup")
chocolate_chips = new ChocolateChips("1 cup")

// Utensils
mixing_bowl = new MixingBowl()
oven = new Oven()

fn cook() {
    mixing_bowl.mix(flour, sugar)
    mixing_bowl.add(chocolate_chips)
    oven.bake("180°C, 12 minutes")
    
    return "Chocolate Chip Cookies"
}
```

---

## 📁 File Naming Conventions

**Format:** `snake_case` with `.food` extension

✅ **Correct:**
- `chocolate_chip_cookies.food`
- `beef_stir_fry.food` 
- `tomato_basil_soup.food`

❌ **Avoid:** Spaces, special characters, or camelCase

---

## 💬 Comments

Use `//` for single-line comments:

```food
// This is a comment explaining the next step
flour.sift()

// Multi-line comments can be written
// across several lines like this
mixing_bowl.mix("until smooth")
```

**Purpose:** Use comments **only** to separate cooking steps.

---

## 🔄 Development Workflow

### 1️⃣ Convert → `recepies/converted/`
Convert raw recipes from various formats (`.docx`, `.txt`, `.pdf`) into `.food` syntax. All recipes must be converted to English `.food` files.

### 2️⃣ Compile → `recepies/compiled/`
Run compilation to add line numbers and verify grammar:
```bash
cd recepies/
python3 compile_recipes.py
```

### 3️⃣ Update Tokens → `grammar/tokens.json`
If compilation fails, add missing elements:
- **Constructors** → `types.ingredients` or `types.utensils`
- **Methods** → appropriate `actions` categories  
- **Functions** → `builtins` array

### 4️⃣ Re-compile → Verification
Verify all tokens are properly defined:
```bash
python3 compile_recipes.py
```

### 5️⃣ Done ✅
Recipes are ready with proper syntax highlighting.

---

## 📖 Long Recipe Management

**Rule:** When `cook()` exceeds **45 lines**, reorganize for book pagination.

### 🔧 Function Extraction Process

1. **Extract logical steps** into separate functions:
   - `prepareIngredients()` - All prep work
   - `makeSauce()` - Sauce preparation  
   - `assembleDish()` - Final assembly

2. **Keep `cook()` concise** by calling helper functions

3. **Maintain readability** - each function = one cooking phase

### 📄 Reorganized Recipe Example
```food
//complex_dish.food

// Ingredients
ingredient1 = new Ingredient1("amount")
ingredient2 = new Ingredient2("amount")

// Utensils
utensil1 = new Utensil1()
utensil2 = new Utensil2()

fn prepareIngredients() {
    // All prep work here
}

fn makeSauce() {
    // Sauce preparation
}

fn cook() {
    prepareIngredients()
    makeSauce()
    // Final assembly and cooking
    
    return "Complex Dish"
}
```

---

## ⚠️ Compilation Requirements

**Critical:** The compilation script will **not compile** recipes if any constructors or methods are missing from `grammar/tokens.json`. This ensures proper syntax highlighting for all recipe elements.
