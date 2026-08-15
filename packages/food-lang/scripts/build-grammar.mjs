import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const tokensPath = path.join(root, 'grammar', 'tokens.json');
const outputPath = path.join(root, 'syntaxes', 'food.tmLanguage.json');

function readTokens() {
  const raw = fs.readFileSync(tokensPath, 'utf8');
  return JSON.parse(raw);
}

// Create a word boundary pattern
function createWordPattern(words) {
  if (!words || words.length === 0) return '';
  return `\\b(?:${words.join('|')})\\b`;
}

// Flatten nested objects into an array
function flattenArray(obj) {
  if (Array.isArray(obj)) return obj;

  let result = [];
  Object.values(obj).forEach((value) => {
    if (Array.isArray(value)) {
      result = result.concat(value);
    } else if (typeof value === 'object') {
      result = result.concat(flattenArray(value));
    }
  });
  return result;
}

function makeGrammar(tokens) {
  // Extract and prepare patterns
  const declKeywords = createWordPattern(tokens.keywords?.declaration || []);
  const controlKeywords = createWordPattern(tokens.keywords?.control || []);

  // Flatten types
  const allTypes = flattenArray(tokens.types);
  const typesPattern = createWordPattern(allTypes);

  // Builtins
  const builtinsPattern = createWordPattern(tokens.builtins || []);

  // Actions (methods for utensils)
  const allActions = flattenArray(tokens.actions);
  const actionsPattern = createWordPattern(allActions);

  // Create the grammar structure
  const grammar = {
    name: 'food',
    scopeName: 'source.food',
    fileTypes: ['food'],
    patterns: [
      { include: '#comments' },
      { include: '#strings' },
      { include: '#keywords' },
      { include: '#types' },
      { include: '#builtins' },
      { include: '#actions' },
      { include: '#functions' },
      { include: '#variables' },
    ],
    repository: {
      comments: {
        patterns: [
          {
            name: 'comment.line.double-slash.food',
            match: '//.*$',
          },
          {
            name: 'comment.block.food',
            begin: '/\\*',
            end: '\\*/',
            patterns: [{ include: '#comments' }],
          },
        ],
      },
      strings: {
        patterns: [
          {
            name: 'string.quoted.double.food',
            begin: '"',
            end: '"',
            patterns: [
              {
                name: 'constant.character.escape.food',
                match: '\\\\.',
              },
            ],
          },
        ],
      },
      keywords: {
        patterns: [
          {
            name: 'keyword.declaration.food',
            match: declKeywords,
          },
          {
            name: 'keyword.control.food',
            match: controlKeywords,
          },
        ],
      },
      types: {
        patterns: [
          {
            name: 'support.class.food',
            match: typesPattern,
          },
        ],
      },
      builtins: {
        patterns: [
          {
            name: 'support.function.builtin.food',
            match: builtinsPattern + '(?=\\s*\\()',
          },
        ],
      },
      actions: {
        patterns: [
          {
            name: 'support.function.method.food',
            match: '\\.' + actionsPattern + '(?=\\s*\\()',
          },
        ],
      },

      functions: {
        patterns: [
          {
            name: 'meta.function.food',
            begin: '\\b(fn)\\b\\s+([A-Za-z_][\\w]*)\\s*(?=\\()',
            beginCaptures: {
              1: { name: 'keyword.declaration.food' },
              2: { name: 'entity.name.function.food' },
            },
            end: '(?=\\()',
          },
          {
            name: 'entity.name.function.food',
            match: '\\b([A-Za-z_][\\w]*)\\b(?=\\s*\\()',
          },
        ],
      },
      variables: {
        patterns: [
          {
            name: 'variable.other.property.food',
            match: '\\.(?:[A-Za-z_][\\w]*)',
          },
          {
            name: 'variable.other.food',
            match: '\\b[a-z_][A-Za-z0-9_]*\\b',
          },
        ],
      },
    },
  };

  return grammar;
}

function main() {
  console.log('Building food grammar...');
  const tokens = readTokens();
  const grammar = makeGrammar(tokens);

  // Write the grammar to the output file
  fs.writeFileSync(outputPath, JSON.stringify(grammar, null, 2));
  console.log(`Generated ${outputPath}`);
}

// Check if this script was run with --watch flag
const isWatchMode = process.argv.includes('--watch');

if (isWatchMode) {
  console.log('Watching for changes...');

  // Initial build
  main();

  // Watch for changes
  fs.watch(tokensPath, (eventType) => {
    if (eventType === 'change') {
      console.log(`${tokensPath} changed. Rebuilding...`);
      try {
        main();
      } catch (error) {
        console.error('Error rebuilding grammar:', error);
      }
    }
  });
} else {
  main();
}
