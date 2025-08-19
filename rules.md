# .food Recipe Language Guide

## Objects

There are only two types of objects:

- ingredients
- utensils

All objects are initialized with the `new` keyword and a constructor. Ingredient constructors often contain amount information, such as `emmental = new Emmental("200g, grated")`. All units must be in metric.

### Ingredients

Ingredients are objects that can be used in recipes. Ingredients do not have any properties or methods.

### Utensils

Utensils are objects that can be used in recipes. Utensils have methods.

### Actions

Actions are anything the user does when cooking. They are methods in the `.food` language. Almost all actions _should_ be methods; only when it doesn’t make sense should they be built-in functions.

Sometimes actions contain arguments. For example, `spatzle_maker.press(mixing_bowl, pot)` and `mixing_bowl.mix("until smooth")` and `rinse(spatzle, "cold water")`. There is room for artistic freedom here, but avoid making things confusing.

#### Methods

Methods are actions that can be performed on utensils. Methods are called on utensils. Examples include `pot.boil()`, `pan.fry()`, and `oven.bake()`.

#### Functions

There are some built-in functions that can be used in recipes. These are used when it doesn’t make sense to make the action a method of the utensil. Examples include `wait()` and `transfer()`.

## Style

All variables are snake_case. All constructors and functions/methods are camelCase. All functions and methods must be defined in the `tokens.json` file for proper highlighting. The main function is always called `cook()`.

## File Naming Conventions

Recipe files should use descriptive, snake_case names with the `.food` extension. Examples:

- `chocolate_chip_cookies.food`
- `beef_stir_fry.food`
- `tomato_basil_soup.food`

Avoid spaces, special characters, or camelCase in filenames.

## Comments

Comments in `.food` files use `//` for single-line comments:

```food
// This is a comment explaining the next step
flour.sift()

// Multi-line comments can be written
// across several lines like this
mixing_bowl.mix("until smooth")
```

Use comments to:

- Only to separate steps

## Development Workflow

The `.food` recipe development follows this workflow:

### 1. Convert → `recepies/converted/`

Convert raw recipes from various formats into `.food` syntax. Files are placed in the `converted/` directory. Recepies may be in documents such as `.docx` files or `.txt` files or `.pdf` files. They may also be in different languages. All should be converted into english `.food` files.

### 2. Compile → `recepies/compiled/`

Run the compilation script to add line numbers and verify grammar:

```bash
cd recepies/
python3 compile_recipes.py
```

### 3. Update Tokens → `grammar/tokens.json`

If compilation fails due to missing constructors or methods:

- Add missing constructors to `types.ingredients` or `types.utensils`
- Add missing methods to appropriate `actions` categories
- Add new built-in functions to `builtins` array

### 4. Re-compile → Verification

Re-run the compilation script to verify all tokens are properly defined:

```bash
python3 compile_recipes.py
```

### 5. Done ✅

Once compilation succeeds with grammar verification, recipes are ready for use with proper syntax highlighting.

**Important:** The compilation script will **not compile** recipes if any constructors or methods are missing from the grammar. This ensures syntax highlighting works correctly for all recipe elements.
