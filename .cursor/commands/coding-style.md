# coding-style

---

description: "This rule provides standards for frontend components and API validation"
alwaysApply: false

---

1. Code conventions to respect

- use PascalCase for component naming conventions
- use "export default function" syntax every time you need to create a new component
- use arrow functions inside components when you need to add behavior to components

2. Concerning CSS style :

- Try first to use shadcn components to construct components, blocs, pages. You can use shadcn MCP server.
- Always use Tailwind if you need to edit css style

1. In API directory:

- Use zod for all validation
- Define return types with zod schemas
- Export types generated from schemas
