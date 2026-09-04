import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
    ...nextVitals,
    {
        // Several interactive views intentionally synchronize browser or timer state
        // after mount; these effects are not derived render state.
        rules: {
            "react-hooks/set-state-in-effect": "off",
        },
    },
    globalIgnores([
        ".next/**",
        "node_modules/**",
        "_repos_equivocados/**",
        "next-env.d.ts",
    ]),
]);
