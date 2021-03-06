module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: [ 'typescript', '@typescript-eslint' ],
	extends: [ 'airbnb-base', 'plugin:prettier/recommended' ],
	rules: {
		// allow debugger during development
		'prettier/prettier': 0,
		// indent: [ 'error', 4 ],
		'linebreak-style': 0,
		'max-len': [ 2, { code: 160, ignoreUrls: true } ],
		radix: [ 'error', 'as-needed' ],
		'object-shorthand': [ 'error', 'methods' ],
		'no-unused-expressions': [
			'error',
			{
				allowShortCircuit: true
			}
		],
		'no-bitwise': [
			'error',
			{
				allow: [ '~' ]
			}
		],
		'import/no-unresolved': 0,
		'import/prefer-default-export': 0,
		'import/no-dynamic-require': 0,
		'object-curly-newline': 0,
		'consistent-return': 0,
		'no-unused-vars': 0,
		'no-useless-constructor': 0,
		'no-empty-function': 0,
		'class-methods-use-this': 0,
		'import/no-extraneous-dependencies': 0,
		'@typescript-eslint/no-unused-vars': 2,
		'@typescript-eslint/no-useless-constructor': 2,
		'no-restricted-syntax': 0,
		'no-param-reassign': 0,
		'no-return-await': 0,
		'no-use-before-define': 0,
		'no-await-in-loop': 0,
		'no-continue': 0,
		'no-plusplus': 0,
		'no-debugger': 0,
		'no-console': 0,
		'import/extensions': 0,
		'padding-line-between-statements': [
			'warn',
			{ blankLine: 'always', prev: [ 'const', 'let', 'var' ], next: '*' },
			{
				blankLine: 'any',
				prev: [ 'const', 'let', 'var' ],
				next: [ 'const', 'let', 'var' ]
			},
			{ blankLine: 'always', prev: '*', next: 'return' },
			{ blankLine: 'always', prev: 'block-like', next: '*' },
			{ blankLine: 'always', prev: 'block', next: '*' },
			{ blankLine: 'always', prev: 'function', next: '*' }
		]
	}
};
