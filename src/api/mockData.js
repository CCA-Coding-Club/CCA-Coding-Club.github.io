/**
 * Mock Data for Development
 * 
 * Used when VITE_ATLAS_API_URL is not configured.
 * Provides realistic sample data for all three collections.
 */

export const mockChallenges = [
  {
    challengeId: 'challenge-001',
    challengeName: 'FizzBuzz Remix',
    challengeCreation: '2026-03-20T00:00:00Z',
    challengeDescription: 'Put a creative twist on the classic FizzBuzz problem with custom rules.',
    challengeDetails: `# FizzBuzz Remix

## The Challenge

Write a program that prints numbers from 1 to 100, but with a creative twist:

- For multiples of **3**, print \`"Fizz"\`
- For multiples of **5**, print \`"Buzz"\`
- For multiples of **both 3 and 5**, print \`"FizzBuzz"\`
- **Bonus:** Add your own rule! For example, for multiples of 7, print your name.

## Requirements

- Use any programming language
- Your solution must handle all numbers from 1 to 100
- Include at least one custom rule beyond the original FizzBuzz

## Example Output

\`\`\`
1
2
Fizz
4
Buzz
Fizz
CodingClub ← (multiples of 7)
8
Fizz
Buzz
...
\`\`\`

## Hints

- Think about the order of your conditional checks
- Consider using modulo (\`%\`) operator
- Try to make your code readable and well-commented

**Good luck! 🚀**`,
  },
  {
    challengeId: 'challenge-002',
    challengeName: 'Palindrome Checker',
    challengeCreation: '2026-03-13T00:00:00Z',
    challengeDescription: 'Build a function that checks if a given string is a palindrome.',
    challengeDetails: `# Palindrome Checker

## The Challenge

Write a function that takes a string and returns whether it's a **palindrome** (reads the same forwards and backwards).

## Requirements

- Ignore case sensitivity (\`"Racecar"\` → true)
- Ignore spaces and punctuation (\`"A man a plan a canal Panama"\` → true)
- Handle edge cases: empty strings, single characters

## Test Cases

| Input | Expected Output |
|-------|----------------|
| \`"racecar"\` | \`true\` |
| \`"hello"\` | \`false\` |
| \`"A man a plan a canal Panama"\` | \`true\` |
| \`""\` | \`true\` |
| \`"a"\` | \`true\` |

## Bonus

- Count how many palindromes exist in a given sentence
- Find the longest palindromic substring

**Happy coding! 🎉**`,
  },
  {
    challengeId: 'challenge-003',
    challengeName: 'Caesar Cipher',
    challengeCreation: '2026-03-06T00:00:00Z',
    challengeDescription: 'Implement a Caesar cipher encoder and decoder with a configurable shift.',
    challengeDetails: `# Caesar Cipher

## The Challenge

Implement a **Caesar cipher** — one of the simplest encryption techniques.

Each letter in the message is shifted by a fixed number of positions in the alphabet.

## Requirements

1. Write an \`encode(message, shift)\` function
2. Write a \`decode(message, shift)\` function
3. Handle uppercase and lowercase letters
4. Leave non-alphabetic characters unchanged

## Example

\`\`\`
encode("Hello World!", 3) → "Khoor Zruog!"
decode("Khoor Zruog!", 3) → "Hello World!"
\`\`\`

## Bonus

- Implement a brute-force decoder that tries all 26 shifts
- Add frequency analysis to auto-detect the shift

**Crack the code! 🔐**`,
  },
];

export const mockSubmissions = [
  {
    challengeId: 'challenge-001',
    memberName: 'Alex',
    lastActivityDate: '2026-03-22T14:30:00Z',
    submissionHistory: [
      { attempt: 2, submissionDate: '2026-03-22T14:30:00Z', submissionId: 102 },
      { attempt: 1, submissionDate: '2026-03-21T10:00:00Z', submissionId: 101 },
    ],
  },
  {
    challengeId: 'challenge-001',
    memberName: 'Jordan',
    lastActivityDate: '2026-03-21T16:45:00Z',
    submissionHistory: [
      { attempt: 1, submissionDate: '2026-03-21T16:45:00Z', submissionId: 103 },
    ],
  },
  {
    challengeId: 'challenge-001',
    memberName: 'Sam',
    lastActivityDate: '2026-03-23T09:15:00Z',
    submissionHistory: [
      { attempt: 3, submissionDate: '2026-03-23T09:15:00Z', submissionId: 106 },
      { attempt: 2, submissionDate: '2026-03-22T11:00:00Z', submissionId: 105 },
      { attempt: 1, submissionDate: '2026-03-21T08:30:00Z', submissionId: 104 },
    ],
  },
  {
    challengeId: 'challenge-002',
    memberName: 'Alex',
    lastActivityDate: '2026-03-15T12:00:00Z',
    submissionHistory: [
      { attempt: 1, submissionDate: '2026-03-15T12:00:00Z', submissionId: 201 },
    ],
  },
];

export const mockSubmissionCode = [
  {
    submissionId: 101,
    submissionDate: '2026-03-21T10:00:00Z',
    submissionCode: `# FizzBuzz Remix - First attempt
for i in range(1, 101):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)`,
  },
  {
    submissionId: 102,
    submissionDate: '2026-03-22T14:30:00Z',
    submissionCode: `# FizzBuzz Remix - Added custom rule!
for i in range(1, 101):
    output = ""
    if i % 3 == 0:
        output += "Fizz"
    if i % 5 == 0:
        output += "Buzz"
    if i % 7 == 0:
        output += "CodingClub"
    print(output or i)`,
  },
  {
    submissionId: 103,
    submissionDate: '2026-03-21T16:45:00Z',
    submissionCode: `// FizzBuzz Remix in JavaScript
for (let i = 1; i <= 100; i++) {
  let result = '';
  if (i % 3 === 0) result += 'Fizz';
  if (i % 5 === 0) result += 'Buzz';
  if (i % 11 === 0) result += 'Lucky';
  console.log(result || i);
}`,
  },
  {
    submissionId: 104,
    submissionDate: '2026-03-21T08:30:00Z',
    submissionCode: `#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 100; i++) {
        if (i % 15 == 0) cout << "FizzBuzz";
        else if (i % 3 == 0) cout << "Fizz";
        else if (i % 5 == 0) cout << "Buzz";
        else cout << i;
        cout << endl;
    }
    return 0;
}`,
  },
  {
    submissionId: 105,
    submissionDate: '2026-03-22T11:00:00Z',
    submissionCode: `#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 100; i++) {
        string out = "";
        if (i % 3 == 0) out += "Fizz";
        if (i % 5 == 0) out += "Buzz";
        if (i % 7 == 0) out += "Club";
        if (out.empty()) cout << i;
        else cout << out;
        cout << "\\n";
    }
    return 0;
}`,
  },
  {
    submissionId: 106,
    submissionDate: '2026-03-23T09:15:00Z',
    submissionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    for (int i = 1; i <= 100; i++) {
        string result;
        if (i % 3 == 0) result += "Fizz";
        if (i % 5 == 0) result += "Buzz";
        if (i % 7 == 0) result += "Club";
        if (i % 13 == 0) result += "Lucky";
        cout << (result.empty() ? to_string(i) : result) << endl;
    }
}`,
  },
  {
    submissionId: 201,
    submissionDate: '2026-03-15T12:00:00Z',
    submissionCode: `def is_palindrome(s):
    """Check if string is a palindrome, ignoring case and non-alphanumeric chars."""
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]

# Test cases
tests = ["racecar", "hello", "A man a plan a canal Panama", "", "a"]
for t in tests:
    print(f'"{t}" -> {is_palindrome(t)}')`,
  },
];
