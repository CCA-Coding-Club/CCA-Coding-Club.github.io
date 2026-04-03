import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './config';
import { submitSolution } from './write';

/**
 * Delete every document in a Firestore collection.
 * Firestore has no "drop collection" — we must delete each doc individually.
 */
async function clearCollection(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  if (snapshot.empty) return 0;

  const batch = writeBatch(db);
  snapshot.forEach(d => batch.delete(d.ref));
  await batch.commit();
  return snapshot.size;
}

/**
 * Wipe all data from the 3 collections.
 */
export async function clearAllData() {
  const results = {
    challenges: await clearCollection('Challenges'),
    submissions: await clearCollection('ChallengeSubmissions'),
    code: await clearCollection('ChallengeSubmissionsCode'),
  };
  return results;
}

/**
 * Seed the database with realistic dummy data using the write module.
 * This exercises the same code path that the Discord bot / web form would use.
 */
export async function seedDummyData() {
  // ── 1. Create challenges (written directly to set specific past dates) ──
  const challenges = [
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

**Crack the code! 🔐**`,
    },
  ];

  const batch = writeBatch(db);
  for (const c of challenges) {
    batch.set(doc(db, 'Challenges', c.challengeId), c);
  }
  await batch.commit();

  // ── 2. Seed submissions using the write module (tests the atomic pipeline) ──
  const submissions = [
    {
      challengeId: 'challenge-001', memberName: 'Alex', attempt: 1,
      code: `# FizzBuzz Remix - First attempt
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
      challengeId: 'challenge-001', memberName: 'Alex', attempt: 2,
      code: `# FizzBuzz Remix - Added custom rule!
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
      challengeId: 'challenge-001', memberName: 'Jordan', attempt: 1,
      code: `// FizzBuzz Remix in JavaScript
for (let i = 1; i <= 100; i++) {
  let result = '';
  if (i % 3 === 0) result += 'Fizz';
  if (i % 5 === 0) result += 'Buzz';
  if (i % 11 === 0) result += 'Lucky';
  console.log(result || i);
}`,
    },
    {
      challengeId: 'challenge-001', memberName: 'Sam', attempt: 1,
      code: `#include <iostream>
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
      challengeId: 'challenge-002', memberName: 'Alex', attempt: 1,
      code: `def is_palindrome(s):
    """Check if string is a palindrome, ignoring case and non-alphanumeric chars."""
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]

# Test cases
tests = ["racecar", "hello", "A man a plan a canal Panama", "", "a"]
for t in tests:
    print(f'"{t}" -> {is_palindrome(t)}')`,
    },
  ];

  // Submit sequentially so attempt numbers are consistent
  for (const s of submissions) {
    await submitSolution(s.challengeId, s.memberName, s.code, s.attempt);
  }

  return { challenges: challenges.length, submissions: submissions.length };
}
