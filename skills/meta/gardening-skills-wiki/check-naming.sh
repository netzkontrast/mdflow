SKILLS_DIR="${1:-$HOME/Documents/GitHub/dotfiles/.claude/skills}"
echo "## Naming & Structure"
issues=0
find "$SKILLS_DIR" -type d -mindepth 2 -maxdepth 2 | while read -r dir; do
    dir_name=$(basename "$dir")
    if [[ "$dir_name" == "INDEX.md" ]] || [[ $(dirname "$dir") == "$SKILLS_DIR" ]]; then
        continue
    fi
    if [[ "$dir_name" =~ [A-Z] ]]; then
        echo "  ⚠️  Mixed case: $dir_name (should be kebab-case)"
        issues=$((issues + 1))
    fi
    if [[ "$dir_name" =~ _ ]]; then
        echo "  ⚠️  Underscore: $dir_name (should use hyphens)"
        issues=$((issues + 1))
    fi
    if [[ -f "$dir/SKILL.md" ]]; then
        type=$(grep "^type:" "$dir/SKILL.md" | head -1 | cut -d: -f2 | xargs)
        if [[ "$type" == "technique" ]] && [[ ! "$dir_name" =~ ing$ ]] && [[ ! "$dir_name" =~ -with- ]] && [[ ! "$dir_name" =~ ^test- ]]; then
            :
        fi
    fi
done
[ $issues -eq 0 ] && echo "  ✅ Directory names OK" || echo "  ⚠️  $issues naming issues"
echo ""
find "$SKILLS_DIR" -type d -empty | while read -r empty_dir; do
    echo "  ⚠️  EMPTY: $(realpath --relative-to="$SKILLS_DIR" "$empty_dir" 2>/dev/null || echo "$empty_dir")"
done
echo ""
find "$SKILLS_DIR" -type f -name "SKILL.md" | while read -r skill_file; do
    skill_name=$(basename $(dirname "$skill_file"))
    if ! grep -q "^name:" "$skill_file"; then
        echo "  ❌ MISSING 'name': $skill_name/SKILL.md"
    fi
    if ! grep -q "^description:" "$skill_file"; then
        echo "  ❌ MISSING 'description': $skill_name/SKILL.md"
    fi
    if ! grep -q "^when_to_use:" "$skill_file"; then
        echo "  ❌ MISSING 'when_to_use': $skill_name/SKILL.md"
    fi
    if ! grep -q "^version:" "$skill_file"; then
        echo "  ⚠️  MISSING 'version': $skill_name/SKILL.md"
    fi
    name_value=$(grep "^name:" "$skill_file" | head -1 | cut -d: -f2- | xargs)
    if [[ "$name_value" =~ ^How\ to ]]; then
        echo "  ⚠️  Passive name: $skill_name has 'How to' prefix (prefer active voice)"
    fi
done
