#!/bin/bash

# Test script for env-store CLI
echo "🧪 Testing env-store CLI..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test directory
TEST_DIR="./test-env-store"
TEST_STORE="$TEST_DIR/test.store"

# Clean up previous test
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"

echo -e "${YELLOW}Setting up test environment...${NC}"

# Test 1: Initialize
echo -e "\n${YELLOW}Test 1: Initialize store${NC}"
echo "test-password" | yarn dev init
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Initialize successful${NC}"
else
    echo -e "${RED}✗ Initialize failed${NC}"
    exit 1
fi

# Test 2: Set secrets
echo -e "\n${YELLOW}Test 2: Set secrets${NC}"
echo "test-password" | yarn dev set testproject API_KEY=abc123 DATABASE_URL=postgres://test
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Set secrets successful${NC}"
else
    echo -e "${RED}✗ Set secrets failed${NC}"
    exit 1
fi

# Test 3: List projects
echo -e "\n${YELLOW}Test 3: List projects${NC}"
echo "test-password" | yarn dev list
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ List projects successful${NC}"
else
    echo -e "${RED}✗ List projects failed${NC}"
    exit 1
fi

# Test 4: Pull secrets
echo -e "\n${YELLOW}Test 4: Pull secrets${NC}"
echo "test-password" | yarn dev pull testproject .env.test
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Pull secrets successful${NC}"
    echo "Generated .env.test file:"
    cat .env.test
else
    echo -e "${RED}✗ Pull secrets failed${NC}"
    exit 1
fi

# Test 5: Push secrets from .env file
echo -e "\n${YELLOW}Test 5: Push secrets from .env file${NC}"
cat > .env.push << EOF
NEW_KEY=new-value
ANOTHER_KEY=another-value
EOF

echo "test-password" | yarn dev push testproject .env.push
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Push secrets successful${NC}"
else
    echo -e "${RED}✗ Push secrets failed${NC}"
    exit 1
fi

# Test 6: Pull again to see merged secrets
echo -e "\n${YELLOW}Test 6: Pull merged secrets${NC}"
echo "test-password" | yarn dev pull testproject .env.merged
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Pull merged secrets successful${NC}"
    echo "Merged .env.merged file:"
    cat .env.merged
else
    echo -e "${RED}✗ Pull merged secrets failed${NC}"
    exit 1
fi

# Test 7: Unset a key
echo -e "\n${YELLOW}Test 7: Unset a key${NC}"
echo "test-password" | yarn dev unset testproject NEW_KEY
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Unset key successful${NC}"
else
    echo -e "${RED}✗ Unset key failed${NC}"
    exit 1
fi

# Test 8: Replace all secrets
echo -e "\n${YELLOW}Test 8: Replace all secrets${NC}"
cat > .env.replace << EOF
REPLACED_KEY=replaced-value
EOF

echo "test-password" | yarn dev replace testproject .env.replace
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Replace secrets successful${NC}"
else
    echo -e "${RED}✗ Replace secrets failed${NC}"
    exit 1
fi

# Test 9: Pull replaced secrets
echo -e "\n${YELLOW}Test 9: Pull replaced secrets${NC}"
echo "test-password" | yarn dev pull testproject .env.replaced
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Pull replaced secrets successful${NC}"
    echo "Replaced .env.replaced file:"
    cat .env.replaced
else
    echo -e "${RED}✗ Pull replaced secrets failed${NC}"
    exit 1
fi

# Test 10: Use custom store path
echo -e "\n${YELLOW}Test 10: Use custom store path${NC}"
echo "test-password" | yarn dev use "$TEST_STORE"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Use custom store successful${NC}"
else
    echo -e "${RED}✗ Use custom store failed${NC}"
    exit 1
fi

# Test 11: Set secrets with custom store
echo -e "\n${YELLOW}Test 11: Set secrets with custom store${NC}"
echo "test-password" | yarn dev set customproject CUSTOM_KEY=custom-value
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Set secrets with custom store successful${NC}"
else
    echo -e "${RED}✗ Set secrets with custom store failed${NC}"
    exit 1
fi

# Clean up
echo -e "\n${YELLOW}Cleaning up test files...${NC}"
rm -f .env.test .env.push .env.merged .env.replace .env.replaced
rm -rf "$TEST_DIR"

echo -e "\n${GREEN}🎉 All tests passed!${NC}"
echo -e "${GREEN}The env-store CLI is working correctly.${NC}" 