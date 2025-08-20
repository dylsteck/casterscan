# ESLint Configuration with Airbnb Standards

This project has been configured with ESLint following the Airbnb JavaScript Style Guide, adapted for TypeScript and Next.js.

## Configuration Overview

- **Base Configuration**: Airbnb-base style guide
- **Framework**: Next.js core web vitals
- **Parser**: TypeScript ESLint parser
- **Plugins**: TypeScript, React, React Hooks

## Key Airbnb Rules Enforced

- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Indentation**: 2 spaces
- **Trailing Commas**: Required in multiline objects/arrays
- **Object Spacing**: Required around braces `{ key: value }`
- **Array Spacing**: No spaces around brackets `[value]`
- **Max Line Length**: 100 characters
- **No Console**: Warns on console statements
- **Import Order**: Enforces proper import ordering

## Available Scripts

```bash
# Run ESLint
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Strict ESLint check (bypasses Next.js optimizations)
npm run lint:strict
```

## Key Features

1. **Next.js Compatible**: Works seamlessly with Next.js 15+
2. **TypeScript Support**: Full TypeScript integration
3. **React Rules**: Proper React and React Hooks linting
4. **Import Management**: Enforces consistent import practices
5. **Code Quality**: Maintains high code quality standards

## Configuration Files

- `.eslintrc.json` - Main ESLint configuration
- `.eslintignore` - Files/directories to ignore during linting

## Common Issues & Solutions

### TypeScript Errors
- Use `@typescript-eslint/no-unused-vars` for unused variables
- Prefix unused variables with underscore: `_unusedParam`

### React Errors
- Remove unused imports
- Add `key` props to mapped JSX elements
- Use Next.js `<Image>` instead of `<img>` tags

### Style Errors
- Use single quotes: `'string'` instead of `"string"`
- Add semicolons at end of statements
- Maintain 2-space indentation
- Keep lines under 100 characters

## Integration with VS Code

For the best experience, install:
- ESLint extension
- Prettier extension (optional, for additional formatting)

Add to your VS Code settings:
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```