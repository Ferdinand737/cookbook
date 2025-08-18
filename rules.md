# Rules for writing recipes in `food` language

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
