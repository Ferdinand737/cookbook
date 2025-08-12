# Food Programming Language

A Visual Studio Code extension for the Food programming language - write recipes as code!

## Features

This extension provides syntax highlighting for the Food programming language, which lets you write cooking recipes as code:

```food
// A simple pancake recipe
fn makePancakes(servings) {
    bowl = new Bowl()

    // Add ingredients
    add(bowl, "flour", 2cups)
    add(bowl, "milk", 1cup)
    add(bowl, "eggs", 2)
    add(bowl, "sugar", 2tbsp)

    // Mix ingredients
    mix(bowl)

    // Cook
    pan = new Pan()
    preheat(pan, 350F)

    for (i in 1..servings) {
        pour(bowl, pan, 0.25cups)
        wait(2m)
        flip(pan)
        wait(1m)
        serve(pan)
    }
}
```

## Custom File Icon

To use a custom icon (🍗) for `.food` files:

1. Install a file icon theme like [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme) or [vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons)
2. Add a custom file association:
   - Open Settings (Ctrl+,)
   - Search for "material-icons.associations.files" (for Material Icon Theme) or similar setting
   - Add a custom association: `"*.food": "cake"` (or another food-related icon)

## Development

This extension is built using TextMate grammar for syntax highlighting.

To modify the language:

1. Edit `grammar/tokens.json` to add/modify keywords, types, etc.
2. Run the build task (`npm run build-grammar`) or watch task (`npm run watch-grammar`)
3. Reload the extension

## License

MIT
