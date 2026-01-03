SKILLS_DIR="${1:-$HOME/Documents/GitHub/dotfiles/.claude/skills}"
echo "## INDEX Coverage"
for category_dir in "$SKILLS_DIR"/*/; do
    category=$(basename "$category_dir")
    [[ ! -d "$category_dir" ]] && continue
    index_file="$category_dir/INDEX.md"
    [[ ! -f "$index_file" ]] && continue
    skill_count=0
    indexed_count=0
    missing_count=0
    while IFS= read -r skill_file; do
        skill_count=$((skill_count + 1))
        skill_name=$(basename $(dirname "$skill_file"))
        if grep -q "@$skill_name/SKILL.md" "$index_file"; then
            indexed_count=$((indexed_count + 1))
        else
            echo "  ❌ NOT INDEXED: $skill_name/SKILL.md"
            missing_count=$((missing_count + 1))
        fi
    done < <(find "$category_dir" -mindepth 2 -type f -name "SKILL.md")
    if [ $skill_count -gt 0 ] && [ $missing_count -eq 0 ]; then
        echo "  ✅ $category: all $skill_count skills indexed"
    elif [ $missing_count -gt 0 ]; then
        echo "  ⚠️  $category: $missing_count/$skill_count skills missing"
    fi
done
echo ""
# Verify INDEX entries have descriptions
find "$SKILLS_DIR" -type f -name "INDEX.md" | while read -r index_file; do
    category=$(basename $(dirname "$index_file"))
    grep -o '@[a-zA-Z0-9-]*/SKILL\.md' "$index_file" | while read -r ref; do
        skill_name=${ref
        skill_name=${skill_name%/SKILL.md}
        line_num=$(grep -n "$ref" "$index_file" | cut -d: -f1)
        description=$(sed -n "${line_num}p" "$index_file" | sed "s|.*$ref *- *||")
        if [[ -z "$description" || "$description" == *"$ref"* ]]; then
            next_line=$((line_num + 1))
            description=$(sed -n "${next_line}p" "$index_file")
            if [[ -z "$description" ]]; then
                echo "  ⚠️  NO DESCRIPTION: $category/INDEX.md reference to $skill_name"
            fi
        fi
    done
done
