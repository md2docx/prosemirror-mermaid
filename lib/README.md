# Prosemirror Mermaid <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

[![test](https://github.com/md2docx/prosemirror-mermaid/actions/workflows/test.yml/badge.svg)](https://github.com/md2docx/prosemirror-mermaid/actions/workflows/test.yml)
[![Maintainability](https://qlty.sh/gh/md2docx/projects/prosemirror-mermaid/maintainability.svg)](https://qlty.sh/gh/md2docx/projects/prosemirror-mermaid)
[![codecov](https://codecov.io/gh/md2docx/prosemirror-mermaid/graph/badge.svg)](https://codecov.io/gh/md2docx/prosemirror-mermaid)
[![Version](https://img.shields.io/npm/v/prosemirror-mermaid.svg?colorB=green)](https://www.npmjs.com/package/prosemirror-mermaid)
[![Downloads](https://img.jsdelivr.com/img.shields.io/npm/d18m/prosemirror-mermaid.svg)](https://www.npmjs.com/package/prosemirror-mermaid)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/prosemirror-mermaid)
[![NPM License](https://img.shields.io/npm/l/prosemirror-mermaid)](../LICENSE)

Prosemirror Mermaid is a comprehensive library designed to unlock the full potential of React 18 server components. It provides customizable loading animation components and a fullscreen loader container, seamlessly integrating with React and Next.js.

✅ Fully Treeshakable (import from `prosemirror-mermaid/client/loader-container`)

✅ Fully TypeScript Supported

✅ Leverages the power of React 18 Server components

✅ Compatible with all React 18 build systems/tools/frameworks

✅ Documented with [Typedoc](https://md2docx.github.io/prosemirror-mermaid) ([Docs](https://md2docx.github.io/prosemirror-mermaid))

✅ Examples for Next.js, and Vite

> <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 20px"/> Star [this repository](https://github.com/md2docx/prosemirror-mermaid) and share it with your friends.

## Getting Started

### Installation

```bash
pnpm add prosemirror-mermaid
```

**_or_**

```bash
npm install prosemirror-mermaid
```

**_or_**

```bash
yarn add prosemirror-mermaid
```

## Want Lite Version? [![npm bundle size](https://img.shields.io/bundlephobia/minzip/prosemirror-mermaid-lite)](https://www.npmjs.com/package/prosemirror-mermaid-lite) [![Version](https://img.shields.io/npm/v/prosemirror-mermaid-lite.svg?colorB=green)](https://www.npmjs.com/package/prosemirror-mermaid-lite) [![Downloads](https://img.jsdelivr.com/img.shields.io/npm/d18m/prosemirror-mermaid-lite.svg)](https://www.npmjs.com/package/prosemirror-mermaid-lite)

```bash
pnpm add prosemirror-mermaid-lite
```

**or**

```bash
npm install prosemirror-mermaid-lite
```

**or**

```bash
yarn add prosemirror-mermaid-lite
```

> You need `r18gs` as a peer-dependency

### Import Styles

You can import styles globally or within specific components.

```css
/* globals.css */
@import "prosemirror-mermaid/styles";
```

```tsx
// layout.tsx
import "prosemirror-mermaid/styles";
```

For selective imports:

```css
/* globals.css */
@import "prosemirror-mermaid/dist/client/index.css"; /** required if you are using LoaderContainer */
@import "prosemirror-mermaid/dist/server/bars/bars1/index.css";
```

### Usage

Using loaders is straightforward.

```tsx
import { Bars1 } from "prosemirror-mermaid/dist/server/bars/bars1";

export default function MyComponent() {
  return someCondition ? <Bars1 /> : <>Something else...</>;
}
```

For detailed API and options, refer to [the API documentation](https://md2docx.github.io/prosemirror-mermaid).

**Using LoaderContainer**

`LoaderContainer` is a fullscreen component. You can add this component directly in your layout and then use `useLoader` hook to toggle its visibility.

```tsx
// layout.tsx
<LoaderContainer />
	 ...
```

```tsx
// some other page or component
import { useLoader } from "prosemirror-mermaid/dist/hooks";

export default MyComponent() {
	const { setLoading } = useLoader();
	useCallback(()=>{
		setLoading(true);
		...do some work
		setLoading(false);
	}, [])
	...
}
```

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=md2docx/prosemirror-mermaid&type=Date)](https://www.star-history.com/#md2docx/prosemirror-mermaid&Date)

## License

This library is licensed under the MPL-2.0 open-source license.



> <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 20px"/> Please enroll in [our courses](https://mayank-chaudhari.vercel.app/courses) or [sponsor](https://github.com/sponsors/mayank1513) our work.

<hr />

<p align="center" style="text-align:center">with 💖 by <a href="https://mayank-chaudhari.vercel.app" target="_blank">Mayank Kumar Chaudhari</a></p>
