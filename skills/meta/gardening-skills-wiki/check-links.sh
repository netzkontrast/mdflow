SKILLS_DIR="${1:-$HOME/Documents/GitHub/dotfiles/.claude/skills}"
echo "## Links & References"
broken_refs=0
backticked_refs=0
relative_refs=0
at_links=0
while IFS= read -r file; do
    grep -nE '`[^`]*@[a-zA-Z0-9._~/-]+\.(md|sh|ts|js|py)[^`]*`' "$file" | while IFS=: read -r line_num match; do
        actual_line=$(sed -n "${line_num}p" "$file")
        if [[ "$actual_line" =~ ^[[:space:]]{4,} ]]; then
            continue
        fi
        code_block_count=$(sed -n "1,${line_num}p" "$file" | grep -c '^```')
        if [ $((code_block_count % 2)) -eq 1 ]; then
            continue
        fi
        ref=$(echo "$match" | grep -o '@[a-zA-Z0-9._~/-]*\.[a-zA-Z0-9]*')
        echo "  ❌ BACKTICKED: $ref on line $line_num"
        echo "     File: $(basename $(dirname "$file"))/$(basename "$file")"
        echo "     Fix: Remove backticks - use bare @ reference"
        backticked_refs=$((backticked_refs + 1))
    done
    grep -nE '(^|[ \(>-])@[a-zA-Z0-9._/-]+\.(md|sh|ts|js|py)' "$file" | \
        grep -v '@[a-zA-Z0-9._%+-]*@' | \
        grep -v 'email.*@' | \
        grep -v '`.*@.*`' | while IFS=: read -r line_num match; do
        ref=$(echo "$match" | grep -o '@[a-zA-Z0-9._/-]+\.(md|sh|ts|js|py)')
        ref_path="${ref#@}"
        actual_line=$(sed -n "${line_num}p" "$file")
        if [[ "$actual_line" =~ ^[[:space:]]{4,} ]]; then
            continue
        fi
        code_block_count=$(sed -n "1,${line_num}p" "$file" | grep -c '^```')
        if [ $((code_block_count % 2)) -eq 1 ]; then
            continue
        fi
        echo "  ❌ @ LINK: $ref on line $line_num"
        echo "     File: $(basename $(dirname "$file"))/$(basename "$file")"
        # Suggest correct format
        if [[ "$ref_path" == skills/* ]]; then
            corrected="${ref_path#skills/}"
            corrected="${corrected%/SKILL.md}"
            echo "     Fix: $ref → skills/$corrected"
        elif [[ "$ref_path" == ../* ]]; then
            echo "     Fix: Convert to skills/category/skill-name format"
        else
            echo "     Fix: Convert to skills/category/skill-name format"
        fi
        at_links=$((at_links + 1))
    done
done < <(find "$SKILLS_DIR" -type f -name "*.md")
total_issues=$((backticked_refs + at_links))
if [ $total_issues -eq 0 ]; then
    echo "  ✅ All skill references OK"
else
    [ $backticked_refs -gt 0 ] && echo "  ❌ $backticked_refs backticked references"
    [ $at_links -gt 0 ] && echo "  ❌ $at_links @ links (force-load context)"
fi
echo ""
echo "Correct format: skills/category/skill-name"
echo "  ❌ Bad:  @skills/path/SKILL.md (force-loads) or @../path (brittle)"
echo "  ✅ Good: skills/category/skill-name (load with Read tool when needed)"
echo ""
# Verify all skills mentioned in INDEX files exist
find "$SKILLS_DIR" -type f -name "INDEX.md" | while read -r index_file; do
    index_dir=$(dirname "$index_file")
    grep -o '@[a-zA-Z0-9-]*/SKILL\.md' "$index_file" | while read -r skill_ref; do
        skill_path="$index_dir/${skill_ref#@}"
        if [[ ! -f "$skill_path" ]]; then
            echo "  ❌ BROKEN: $skill_ref in $(basename "$index_dir")/INDEX.md"
            echo "     Expected: $skill_path"
        fi
    done
done
echo ""
find "$SKILLS_DIR" -type f -path "*/*/SKILL.md" | while read -r skill_file; do
    skill_dir=$(basename $(dirname "$skill_file"))
    category_dir=$(dirname $(dirname "$skill_file"))
    index_file="$category_dir/INDEX.md"
    if [[ -f "$index_file" ]]; then
        if ! grep -q "@$skill_dir/SKILL.md" "$index_file"; then
            echo "  ⚠️  ORPHANED: $skill_dir/SKILL.md not in $(basename "$category_dir")/INDEX.md"
        fi
    fi
done
