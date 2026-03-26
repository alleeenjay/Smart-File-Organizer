 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/.eslintrc.cjs b/.eslintrc.cjs
new file mode 100644
index 0000000000000000000000000000000000000000..f5639636034d5069c0ac458c93d85a4966f784f6
--- /dev/null
+++ b/.eslintrc.cjs
@@ -0,0 +1,11 @@
+module.exports = {
+  root: true,
+  env: { browser: true, es2020: true, node: true },
+  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended'],
+  ignorePatterns: ['dist', 'dist-electron'],
+  parser: '@typescript-eslint/parser',
+  plugins: ['react-refresh', '@typescript-eslint'],
+  rules: {
+    'react-refresh/only-export-components': 'off'
+  }
+};
 
EOF
)
