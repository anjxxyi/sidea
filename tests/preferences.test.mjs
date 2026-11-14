import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const startup = readFileSync(new URL('../public/preferences.js', import.meta.url), 'utf8');
const persistence = ts.transpileModule(
  readFileSync(new URL('../src/lib/preferences.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;

function restore(storage = new Map()) {
  const root = { dataset: {}, lang: '' };
  let themeColor;
  runInNewContext(startup, {
    localStorage: { getItem: (key) => storage.get(key) ?? null },
    document: {
      documentElement: root,
      querySelector: () => ({ setAttribute: (_, value) => (themeColor = value) }),
    },
  });
  return { theme: root.dataset.theme, lang: root.lang, themeColor };
}

function writer(storage) {
  const exports = {};
  runInNewContext(persistence, { exports, localStorage: storage });
  return exports.savePreference;
}

test('first visit starts in light mode and English', () => {
  assert.deepEqual(restore(), { theme: 'light', lang: 'en', themeColor: '#FBFBFB' });
});

test('theme and language choices survive a new page session', () => {
  const values = new Map();
  const save = writer({ setItem: (key, value) => values.set(key, value) });
  save('theme', 'dark');
  save('lang', 'kr');
  assert.deepEqual(restore(values), { theme: 'dark', lang: 'ko', themeColor: '#262626' });
  save('theme', 'light');
  save('lang', 'en');
  assert.deepEqual(restore(values), { theme: 'light', lang: 'en', themeColor: '#FBFBFB' });
});

test('each preference restores independently', () => {
  assert.equal(restore(new Map([['sidea.theme.v1', 'dark']])).lang, 'en');
  assert.equal(restore(new Map([['sidea.lang.v1', 'kr']])).theme, 'light');
});

test('invalid saved values fall back without discarding the valid choice', () => {
  const result = restore(
    new Map([
      ['sidea.theme.v1', 'invalid'],
      ['sidea.lang.v1', 'kr'],
    ]),
  );
  assert.deepEqual(result, { theme: 'light', lang: 'ko', themeColor: '#FBFBFB' });
  assert.equal(restore(new Map([['sidea.lang.v1', 'invalid']])).lang, 'en');
});

test('blocked storage reads still allow the default page to render', () => {
  const values = {
    get() {
      throw new Error('Storage blocked');
    },
  };
  assert.deepEqual(restore(values), { theme: 'light', lang: 'en', themeColor: '#FBFBFB' });
});

test('blocked storage writes do not break preference changes', () => {
  const save = writer({
    setItem() {
      throw new Error('Storage full');
    },
  });
  assert.doesNotThrow(() => save('theme', 'dark'));
  assert.doesNotThrow(() => save('lang', 'kr'));
});
