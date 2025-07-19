import * as monaco from 'monaco-editor';

export const configureMonaco = () => {
  // === JavaScript/TypeScript Compiler Options ===
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES6,
    allowNonTsExtensions: true,
  });

  // === Python Support ===
  monaco.languages.register({ id: 'python' });
  monaco.languages.setMonarchTokensProvider('python', {
    defaultToken: '',
    tokenPostfix: '.python',

    keywords: [
      'and', 'as', 'assert', 'break', 'class', 'continue', 'def',
      'del', 'elif', 'else', 'except', 'finally', 'for', 'from',
      'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
      'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'
    ],

    operators: [
      '=', '>', '<', '==', '!=', '<=', '>=', '+', '-', '*', '/', '//',
      '%', '**', '+=', '-=', '*=', '/=', '%=', '**=', '//='
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    tokenizer: {
      root: [
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier',
          }
        }],
        { include: '@whitespace' },
        [/[{}[\]()]/, '@brackets'],
        [/@symbols/, 'operator'],
        [/\d+/, 'number'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
        [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
        [/"/, 'string', '@string."'],
        [/'/, 'string', "@string.'"]
      ],

      whitespace: [
        [/\s+/, 'white'],
        [/(^#.*$)/, 'comment'],
      ],

      string: [
        [/[^\\"']+/, 'string'],
        [/\\./, 'string.escape'],
        [/"|'/, {
          cases: {
            '$#==$S2': { token: 'string', next: '@pop' },
            '@default': 'string'
          }
        }]
      ],
    }
  });

  // === C++ Support ===
  monaco.languages.register({ id: 'cpp' });
  monaco.languages.setMonarchTokensProvider('cpp', {
    defaultToken: '',
    tokenPostfix: '.cpp',

    keywords: [
      'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand',
      'bitor', 'bool', 'break', 'case', 'catch', 'char', 'char16_t',
      'char32_t', 'class', 'compl', 'concept', 'const', 'const_cast',
      'continue', 'decltype', 'default', 'delete', 'do', 'double',
      'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern',
      'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int',
      'long', 'mutable', 'namespace', 'new', 'noexcept', 'not',
      'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private',
      'protected', 'public', 'register', 'reinterpret_cast', 'return',
      'short', 'signed', 'sizeof', 'static', 'static_assert',
      'static_cast', 'struct', 'switch', 'template', 'this', 'thread_local',
      'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union',
      'unsigned', 'using', 'virtual', 'void', 'volatile', 'wchar_t',
      'while', 'xor', 'xor_eq'
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    tokenizer: {
      root: [
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier',
          }
        }],
        { include: '@whitespace' },
        [/[{}[\]()]/, '@brackets'],
        [/@symbols/, 'operator'],
        [/\d+/, 'number'],
        [/".*?"/, 'string'],
        [/'.*?'/, 'string'],
      ],

      whitespace: [
        [/\s+/, 'white'],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
      ],

      comment: [
        [/[^*/]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/./, 'comment']
      ]
    }
  });

  // === Java Support ===
  monaco.languages.register({ id: 'java' });
  monaco.languages.setMonarchTokensProvider('java', {
    defaultToken: '',
    tokenPostfix: '.java',

    keywords: [
      'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch',
      'char', 'class', 'const', 'continue', 'default', 'do', 'double',
      'else', 'enum', 'extends', 'final', 'finally', 'float', 'for',
      'goto', 'if', 'implements', 'import', 'instanceof', 'int',
      'interface', 'long', 'native', 'new', 'package', 'private',
      'protected', 'public', 'return', 'short', 'static', 'strictfp',
      'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
      'transient', 'try', 'void', 'volatile', 'while'
    ],

    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    tokenizer: {
      root: [
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier',
          }
        }],
        { include: '@whitespace' },
        [/[{}[\]()]/, '@brackets'],
        [/@symbols/, 'operator'],
        [/\d+/, 'number'],
        [/".*?"/, 'string'],
        [/'.*?'/, 'string'],
      ],

      whitespace: [
        [/\s+/, 'white'],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
      ],

      comment: [
        [/[^*/]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/./, 'comment']
      ]
    }
  });
};
