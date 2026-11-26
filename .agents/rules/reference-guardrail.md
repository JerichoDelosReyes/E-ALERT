# Guardrail: `reference/` is a read-only archive

`reference/FoodShockPH` and `reference/Fuel2FoodPH` hold legacy code and datasets.

1. Never build, run, deploy or install packages inside `reference/`.
2. Never modify files in `reference/`. Reading datasets and scripts for inspection is fine.
3. New code goes in the monorepo folders: `apps/web`, `apps/api`, `pipeline`, `supabase`.
4. Legacy outputs (`reference/Fuel2FoodPH/outputs/*.csv`) are NOT thesis results. Never present them as FoodShock findings.
5. Datasets on disk are described in `vault/08 Datasets/`; check its Data Gap Analysis before relying on any file.
