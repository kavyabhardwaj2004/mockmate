export interface Topic {
  topic: string;
  core_question: string;
  sub_questions: string[];
  ideal_answer: string;
  must_have_keywords: string[];
  common_mistakes: string[];
  rating_guide: Record<number, string>;
  evaluation_weights: Record<string, number>;

}
// Ensure 5 valid domains: DSA, WebDev, AIML, Cyber, DevOps as requested in the doc
export const DOMAIN_TOPICS: Record<string, Record<string, Topic[]>> = {
DSA: {
  Beginner: [
    {
      topic: "Arrays & Strings",
      core_question: "Can you explain how you would reverse an array in-place, and what its time complexity would be?",
      sub_questions: [
        "Mention using two pointers",
        "State O(N) time complexity",
        "State O(1) space complexity"
      ],

      ideal_answer:
        "I would use two pointers, one at the start and one at the end of the array. I would swap the elements and move both pointers toward the center until they meet. This reverses the array in-place with O(N) time complexity and O(1) extra space.",

      must_have_keywords: [
        "two pointers",
        "swap",
        "start",
        "end",
        "in-place",
        "O(N)",
        "O(1)"
      ],

      common_mistakes: [
        "Using an extra array",
        "Wrong complexity",
        "Not mentioning two pointers"
      ],

      rating_guide: {
        1: "Cannot explain reversal.",
        2: "Knows reversal but incorrect approach.",
        3: "Mentions swapping elements.",
        4: "Explains two pointers and O(N).",
        5: "Explains two pointers, O(N) time, O(1) space, and in-place operation."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Linked Lists",
      core_question: "What is the difference between a singly and doubly linked list, and when would you use one over the other?",
      sub_questions: [
        "Mention previous node pointer in doubly linked list",
        "Mention trade-off (memory vs fast reverse traversal)",
        "Give a use case (e.g. browser history)"
      ],

      ideal_answer:
        "A singly linked list stores only the next pointer, while a doubly linked list stores both previous and next pointers. Doubly linked lists require more memory but allow efficient reverse traversal. Browser history is a common use case.",

      must_have_keywords: [
        "next pointer",
        "previous pointer",
        "doubly linked list",
        "reverse traversal",
        "memory overhead",
        "browser history"
      ],

      common_mistakes: [
        "Not mentioning previous pointer",
        "Ignoring memory tradeoff",
        "No use case"
      ],

      rating_guide: {
        1: "Cannot distinguish the two.",
        2: "Knows names but not differences.",
        3: "Mentions previous pointer.",
        4: "Explains memory and traversal tradeoff.",
        5: "Explains structure, tradeoff, and practical use case."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Stacks & Queues",
      core_question: "Explain the difference between a Stack and a Queue data structure.",
      sub_questions: [
        "LIFO vs FIFO",
        "Mention push/pop operations",
        "Mention enqueue/dequeue operations"
      ],

      ideal_answer:
        "A Stack follows LIFO (Last In First Out) and supports push and pop operations. A Queue follows FIFO (First In First Out) and supports enqueue and dequeue operations.",

      must_have_keywords: [
        "LIFO",
        "FIFO",
        "push",
        "pop",
        "enqueue",
        "dequeue"
      ],

      common_mistakes: [
        "Mixing up LIFO and FIFO",
        "Not mentioning operations",
        "No comparison"
      ],

      rating_guide: {
        1: "Incorrect explanation.",
        2: "Knows one structure only.",
        3: "Mentions LIFO/FIFO.",
        4: "Mentions operations correctly.",
        5: "Clearly compares both with operations."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Trees",
      core_question: "What is a Binary Search Tree and what are its key properties?",
      sub_questions: [
        "Left child is smaller",
        "Right child is greater",
        "O(log N) lookup time for balanced trees"
      ],

      ideal_answer:
        "A Binary Search Tree is a binary tree where values smaller than the root are stored in the left subtree and larger values are stored in the right subtree. Search operations take O(log N) time in a balanced BST.",

      must_have_keywords: [
        "left subtree",
        "right subtree",
        "smaller",
        "greater",
        "balanced BST",
        "O(log N)"
      ],

      common_mistakes: [
        "Confusing BST with binary tree",
        "Missing ordering property",
        "Wrong complexity"
      ],

      rating_guide: {
        1: "Cannot define BST.",
        2: "Partial definition.",
        3: "Mentions left and right ordering.",
        4: "Mentions balanced search complexity.",
        5: "Clearly explains ordering and complexity."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Sorting",
      core_question: "Describe how Bubble Sort works and its time complexity.",
      sub_questions: [
        "Repeatedly stepping through list",
        "Swapping adjacent elements",
        "O(N^2) time complexity"
      ],

      ideal_answer:
        "Bubble Sort repeatedly compares adjacent elements and swaps them if they are in the wrong order. This process continues until the array becomes sorted. Its time complexity is O(N²).",

      must_have_keywords: [
        "adjacent elements",
        "swap",
        "repeated passes",
        "sorted",
        "O(N²)"
      ],

      common_mistakes: [
        "Wrong sorting logic",
        "Wrong complexity",
        "Confusing with selection sort"
      ],

      rating_guide: {
        1: "Cannot explain algorithm.",
        2: "Knows swapping only.",
        3: "Explains adjacent comparison.",
        4: "Mentions repeated passes.",
        5: "Explains algorithm and O(N²) complexity."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    }
  ],

  Advanced: [
    {
      topic: "Dynamic Programming",
      core_question: "Explain the concept of memoization in dynamic programming with an example.",
      sub_questions: [
        "Storing results of expensive function calls",
        "Top-down approach",
        "Provide Fibonacci or similar example"
      ],

      ideal_answer:
        "Memoization stores results of previously computed subproblems to avoid repeated calculations. It is a top-down dynamic programming technique. Fibonacci is a common example.",

      must_have_keywords: [
        "memoization",
        "cache",
        "store results",
        "top-down",
        "overlapping subproblems",
        "Fibonacci"
      ],

      common_mistakes: [
        "Confusing memoization with tabulation",
        "No example",
        "Not mentioning caching"
      ],

      rating_guide: {
        1: "Cannot define memoization.",
        2: "Vague DP explanation.",
        3: "Mentions storing results.",
        4: "Mentions top-down approach.",
        5: "Explains caching with Fibonacci example."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Graphs",
      core_question: "How would you detect a cycle in a directed graph?",
      sub_questions: [
        "DFS traversal",
        "Keeping track of recursion stack (visited states)",
        "Mentioning back edges"
      ],

      ideal_answer:
        "I would use DFS traversal and maintain both a visited set and a recursion stack. If I encounter a node already present in the recursion stack, a back edge exists and the graph contains a cycle.",

      must_have_keywords: [
        "DFS",
        "visited",
        "recursion stack",
        "back edge",
        "cycle detection"
      ],

      common_mistakes: [
        "Using BFS without explanation",
        "Missing recursion stack",
        "Not mentioning back edge"
      ],

      rating_guide: {
        1: "No valid approach.",
        2: "Mentions DFS only.",
        3: "Uses visited nodes.",
        4: "Mentions recursion stack.",
        5: "Explains DFS, recursion stack, and back edge."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Advanced Data Structures",
      core_question: "What is a Trie and what are its main applications?",
      sub_questions: [
        "Prefix tree structure",
        "Used for autocomplete/spell check",
        "O(L) search time where L is string length"
      ],

      ideal_answer:
        "A Trie is a prefix tree used to store strings efficiently. It is commonly used for autocomplete, spell checking, and dictionary lookups. Search complexity is O(L), where L is the length of the string.",

      must_have_keywords: [
        "Trie",
        "prefix tree",
        "autocomplete",
        "spell check",
        "O(L)"
      ],

      common_mistakes: [
        "Calling it a hash table",
        "Missing applications",
        "Wrong complexity"
      ],

      rating_guide: {
        1: "Cannot define Trie.",
        2: "Knows it stores strings.",
        3: "Mentions prefix structure.",
        4: "Mentions applications.",
        5: "Explains structure, applications, and complexity."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "System Design - Algorithms",
      core_question: "How would you design a rate limiter?",
      sub_questions: [
        "Token bucket or Leaky bucket algorithm",
        "Using distributed cache like Redis",
        "Handling concurrency"
      ],

      ideal_answer:
        "I would use a Token Bucket or Leaky Bucket algorithm to control request rates. Request counters can be stored in Redis for distributed systems, and concurrency should be handled atomically.",

      must_have_keywords: [
        "rate limiting",
        "token bucket",
        "leaky bucket",
        "Redis",
        "distributed",
        "concurrency"
      ],

      common_mistakes: [
        "No algorithm mentioned",
        "Ignoring distributed systems",
        "Ignoring concurrency"
      ],

      rating_guide: {
        1: "No practical solution.",
        2: "Basic request counting.",
        3: "Mentions bucket algorithm.",
        4: "Mentions Redis.",
        5: "Explains algorithm, Redis, and concurrency handling."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Concurrency",
      core_question: "Explain what a deadlock is and the four necessary conditions for it to occur.",
      sub_questions: [
        "Mutual exclusion",
        "Hold and wait",
        "No preemption",
        "Circular wait"
      ],

      ideal_answer:
        "A deadlock occurs when processes wait indefinitely for resources held by each other. The four necessary conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",

      must_have_keywords: [
        "deadlock",
        "mutual exclusion",
        "hold and wait",
        "no preemption",
        "circular wait"
      ],

      common_mistakes: [
        "Missing one condition",
        "Confusing starvation with deadlock",
        "No definition"
      ],

      rating_guide: {
        1: "Cannot define deadlock.",
        2: "Partial explanation.",
        3: "Defines deadlock.",
        4: "Lists some conditions.",
        5: "Defines deadlock and correctly states all four conditions."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    }
  ]
},
WebDev: {
  Beginner: [
    {
      topic: "HTML/CSS",
      core_question: "What is the CSS Box Model?",
      sub_questions: [
        "Content",
        "Padding",
        "Border",
        "Margin"
      ],

      ideal_answer:
        "The CSS Box Model describes how elements are rendered. It consists of Content, Padding, Border, and Margin. These layers determine the total size and spacing of an element.",

      must_have_keywords: [
        "content",
        "padding",
        "border",
        "margin",
        "element size"
      ],

      common_mistakes: [
        "Missing one of the four layers",
        "Confusing padding with margin",
        "Not explaining element sizing"
      ],

      rating_guide: {
        1: "Cannot explain Box Model.",
        2: "Mentions only content and margin.",
        3: "Lists most layers.",
        4: "Explains all layers.",
        5: "Explains all layers and their effect on element sizing."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "JavaScript",
      core_question: "Explain the difference between let, const, and var.",
      sub_questions: [
        "Block scope vs function scope",
        "Reassignment rules",
        "Hoisting behavior"
      ],

      ideal_answer:
        "let and const are block-scoped, while var is function-scoped. Variables declared with let can be reassigned, const cannot be reassigned, and var is hoisted differently from let and const.",

      must_have_keywords: [
        "block scope",
        "function scope",
        "let",
        "const",
        "var",
        "hoisting",
        "reassignment"
      ],

      common_mistakes: [
        "Saying const is immutable",
        "Ignoring scope differences",
        "Not mentioning hoisting"
      ],

      rating_guide: {
        1: "Cannot differentiate them.",
        2: "Knows only reassignment rules.",
        3: "Mentions scope differences.",
        4: "Mentions scope and hoisting.",
        5: "Clearly explains scope, reassignment, and hoisting."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "React Basics",
      core_question: "What is the Virtual DOM and how does it improve performance?",
      sub_questions: [
        "In-memory representation of UI",
        "Diffing algorithm",
        "Batching DOM updates"
      ],

      ideal_answer:
        "The Virtual DOM is an in-memory representation of the real DOM. React compares changes using a diffing algorithm and updates only the necessary parts of the real DOM, reducing expensive DOM operations.",

      must_have_keywords: [
        "virtual DOM",
        "in-memory",
        "diffing",
        "real DOM",
        "DOM updates",
        "performance"
      ],

      common_mistakes: [
        "Saying Virtual DOM replaces DOM completely",
        "Not mentioning diffing",
        "Not explaining performance benefits"
      ],

      rating_guide: {
        1: "Cannot explain Virtual DOM.",
        2: "Knows it exists but not why.",
        3: "Mentions comparison with DOM.",
        4: "Explains diffing.",
        5: "Explains diffing and efficient DOM updates."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Browser APIs",
      core_question: "What is localStorage and how differs from sessionStorage?",
      sub_questions: [
        "Persistent across sessions",
        "sessionStorage clears on tab close",
        "Both are client-side only"
      ],

      ideal_answer:
        "Both localStorage and sessionStorage are client-side storage mechanisms. localStorage persists across browser sessions, while sessionStorage is cleared when the tab or session ends.",

      must_have_keywords: [
        "localStorage",
        "sessionStorage",
        "persistent",
        "tab close",
        "client-side storage"
      ],

      common_mistakes: [
        "Confusing cookies with storage",
        "Wrong persistence behavior",
        "Ignoring client-side nature"
      ],

      rating_guide: {
        1: "Cannot explain storage APIs.",
        2: "Knows one API only.",
        3: "Mentions persistence difference.",
        4: "Explains both APIs correctly.",
        5: "Explains persistence and client-side behavior."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Responsive Design",
      core_question: "How do you make a website responsive?",
      sub_questions: [
        "Media queries",
        "Flexbox/Grid",
        "Relative units (rem, %, vh, vw)"
      ],

      ideal_answer:
        "I use media queries to adapt layouts for different screen sizes, Flexbox or CSS Grid for flexible layouts, and relative units like rem, %, vh, and vw instead of fixed dimensions.",

      must_have_keywords: [
        "media queries",
        "flexbox",
        "grid",
        "responsive",
        "rem",
        "%",
        "vh",
        "vw"
      ],

      common_mistakes: [
        "Only mentioning media queries",
        "Using fixed widths everywhere",
        "Ignoring layout systems"
      ],

      rating_guide: {
        1: "Cannot explain responsiveness.",
        2: "Mentions media queries only.",
        3: "Mentions responsive layouts.",
        4: "Includes Flexbox/Grid.",
        5: "Includes media queries, layout systems, and relative units."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    }
  ],

  Advanced: [
    {
      topic: "React Performance",
      core_question: "How do you optimize a React application that is suffering from slow renders?",
      sub_questions: [
        "useMemo/useCallback",
        "React.memo",
        "Code splitting / lazy loading"
      ],

      ideal_answer:
        "I would reduce unnecessary re-renders using React.memo, useMemo, and useCallback. I would also implement code splitting and lazy loading to reduce bundle size and improve loading performance.",

      must_have_keywords: [
        "React.memo",
        "useMemo",
        "useCallback",
        "re-render",
        "lazy loading",
        "code splitting"
      ],

      common_mistakes: [
        "Using memoization everywhere",
        "Ignoring bundle size",
        "Not addressing re-renders"
      ],

      rating_guide: {
        1: "No optimization strategy.",
        2: "General performance discussion.",
        3: "Mentions memoization.",
        4: "Mentions React.memo and hooks.",
        5: "Covers memoization and bundle optimization."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "SSR vs CSR",
      core_question: "What are the tradeoffs between Server-Side Rendering and Client-Side Rendering?",
      sub_questions: [
        "SEO benefits for SSR",
        "Initial load time vs interaction time",
        "Server load considerations"
      ],

      ideal_answer:
        "SSR renders content on the server, improving SEO and initial page load. CSR renders in the browser and provides rich interactions after loading. SSR increases server workload, while CSR shifts more work to the client.",

      must_have_keywords: [
        "SSR",
        "CSR",
        "SEO",
        "initial load",
        "server load",
        "client-side"
      ],

      common_mistakes: [
        "Saying SSR is always better",
        "Ignoring SEO",
        "Ignoring server cost"
      ],

      rating_guide: {
        1: "Cannot compare SSR and CSR.",
        2: "Knows only one approach.",
        3: "Mentions SEO.",
        4: "Explains load tradeoffs.",
        5: "Explains SEO, performance, and server considerations."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "State Management",
      core_question: "Explain how Redux or Zustand works under the hood.",
      sub_questions: [
        "Global store",
        "Immutability principle",
        "Subscribing to state changes"
      ],

      ideal_answer:
        "Redux and Zustand use a centralized store to manage application state. Components subscribe to state changes, and updates follow immutability principles to ensure predictable state management.",

      must_have_keywords: [
        "global store",
        "state",
        "subscribe",
        "immutability",
        "predictable updates"
      ],

      common_mistakes: [
        "Calling Redux a database",
        "Ignoring subscriptions",
        "Ignoring immutability"
      ],

      rating_guide: {
        1: "Cannot explain state management.",
        2: "Knows only store concept.",
        3: "Mentions global state.",
        4: "Mentions subscriptions.",
        5: "Explains store, subscriptions, and immutability."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Security",
      core_question: "What is Cross-Site Scripting (XSS) and how do you prevent it in a React app?",
      sub_questions: [
        "Injecting malicious scripts",
        "React auto-escapes string variables",
        "Dangers of dangerouslySetInnerHTML"
      ],

      ideal_answer:
        "XSS occurs when malicious scripts are injected into web pages. React automatically escapes string content, which helps prevent XSS. Developers should avoid unsafe use of dangerouslySetInnerHTML and properly sanitize user input.",

      must_have_keywords: [
        "XSS",
        "malicious script",
        "React escapes",
        "dangerouslySetInnerHTML",
        "sanitization"
      ],

      common_mistakes: [
        "Ignoring sanitization",
        "Not mentioning React protection",
        "No prevention strategy"
      ],

      rating_guide: {
        1: "Cannot define XSS.",
        2: "Knows it is a security issue.",
        3: "Mentions malicious scripts.",
        4: "Mentions React escaping.",
        5: "Explains attack and prevention clearly."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Web Architecture",
      core_question: "Explain the concept of Micro-frontends.",
      sub_questions: [
        "Independent deployment",
        "Team autonomy",
        "Integration approaches (build-time vs runtime)"
      ],

      ideal_answer:
        "Micro-frontends divide a frontend application into independently deployable modules owned by different teams. This improves team autonomy and scalability. Integration can happen at build time or runtime.",

      must_have_keywords: [
        "micro-frontends",
        "independent deployment",
        "team autonomy",
        "scalability",
        "build-time",
        "runtime integration"
      ],

      common_mistakes: [
        "Confusing with microservices",
        "Ignoring deployment independence",
        "Ignoring integration methods"
      ],

      rating_guide: {
        1: "Cannot explain concept.",
        2: "Very vague explanation.",
        3: "Mentions modular frontend.",
        4: "Mentions team ownership.",
        5: "Explains deployment, autonomy, and integration."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    }
  ]
},
AIML: {
  Beginner: [
    {
      topic: "Supervised Learning",
      core_question: "What is the difference between classification and regression?",
      sub_questions: [
        "Categorical vs continuous output",
        "Examples for each",
        "Different error metrics (Accuracy vs MSE)"
      ],

      ideal_answer:
        "Classification predicts categorical labels such as spam or not spam, while regression predicts continuous values such as house prices. Classification commonly uses Accuracy, whereas regression uses metrics like MSE or RMSE.",

      must_have_keywords: [
        "classification",
        "regression",
        "categorical",
        "continuous",
        "accuracy",
        "MSE",
        "house price",
        "spam detection"
      ],

      common_mistakes: [
        "Confusing outputs",
        "Not giving examples",
        "Wrong evaluation metrics"
      ],

      rating_guide: {
        1: "Cannot differentiate classification and regression.",
        2: "Knows examples but not output differences.",
        3: "Mentions categorical vs continuous.",
        4: "Includes examples and metrics.",
        5: "Clearly explains outputs, examples, and evaluation metrics."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Overfitting",
      core_question: "What is overfitting and how can you prevent it?",
      sub_questions: [
        "Model learning noise",
        "Regularization (L1/L2)",
        "Cross-validation or early stopping"
      ],

      ideal_answer:
        "Overfitting occurs when a model learns noise and patterns specific to the training data, causing poor generalization. It can be reduced using regularization techniques like L1/L2, cross-validation, early stopping, and collecting more data.",

      must_have_keywords: [
        "overfitting",
        "noise",
        "generalization",
        "L1",
        "L2",
        "cross-validation",
        "early stopping"
      ],

      common_mistakes: [
        "Confusing with underfitting",
        "No prevention techniques",
        "Ignoring generalization"
      ],

      rating_guide: {
        1: "Cannot define overfitting.",
        2: "Basic definition only.",
        3: "Mentions memorizing training data.",
        4: "Mentions prevention methods.",
        5: "Explains cause, impact, and multiple prevention techniques."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Neural Networks",
      core_question: "What is an activation function and why is it needed?",
      sub_questions: [
        "Introduces non-linearity",
        "Examples like ReLU or Sigmoid",
        "Without it, NN is just linear regression"
      ],

      ideal_answer:
        "An activation function introduces non-linearity into a neural network, allowing it to learn complex patterns. Common examples include ReLU and Sigmoid. Without activation functions, multiple layers would behave like a linear model.",

      must_have_keywords: [
        "activation function",
        "non-linearity",
        "ReLU",
        "Sigmoid",
        "complex patterns",
        "linear model"
      ],

      common_mistakes: [
        "Only naming functions",
        "Not explaining non-linearity",
        "Ignoring importance"
      ],

      rating_guide: {
        1: "Cannot explain activation functions.",
        2: "Mentions ReLU only.",
        3: "Defines activation function.",
        4: "Explains non-linearity.",
        5: "Explains purpose, examples, and why it is necessary."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Data Preprocessing",
      core_question: "Why is feature scaling important in algorithms like KNN or SVM?",
      sub_questions: [
        "Distance-based algorithms",
        "Prevents features with large ranges dominating",
        "Normalization vs Standardization"
      ],

      ideal_answer:
        "Feature scaling is important because KNN and SVM rely on distance calculations. Features with larger ranges can dominate the distance metric. Common techniques include normalization and standardization.",

      must_have_keywords: [
        "feature scaling",
        "distance-based",
        "KNN",
        "SVM",
        "normalization",
        "standardization"
      ],

      common_mistakes: [
        "Not mentioning distance calculations",
        "Ignoring scaling methods",
        "Wrong algorithm examples"
      ],

      rating_guide: {
        1: "Cannot explain feature scaling.",
        2: "Knows scaling exists.",
        3: "Mentions distance-based algorithms.",
        4: "Explains dominance issue.",
        5: "Explains need and scaling methods."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Model Evaluation",
      core_question: "Explain precision and recall.",
      sub_questions: [
        "True positives over predicted positives",
        "True positives over actual positives",
        "Trade-off between them"
      ],

      ideal_answer:
        "Precision measures how many predicted positives are actually correct and is calculated as TP/(TP+FP). Recall measures how many actual positives are correctly identified and is calculated as TP/(TP+FN). There is often a trade-off between precision and recall.",

      must_have_keywords: [
        "precision",
        "recall",
        "true positive",
        "false positive",
        "false negative",
        "trade-off"
      ],

      common_mistakes: [
        "Swapping definitions",
        "Missing formulas",
        "Ignoring trade-off"
      ],

      rating_guide: {
        1: "Cannot define precision or recall.",
        2: "Knows one metric only.",
        3: "Defines both metrics.",
        4: "Includes formulas.",
        5: "Defines both metrics and explains trade-offs."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    }
  ],

  Advanced: [
    {
      topic: "Transformers",
      core_question: "Explain the self-attention mechanism in Transformers.",
      sub_questions: [
        "Query, Key, Value matrices",
        "Computing attention weights",
        "Allowing parallelization over sequences"
      ],

      ideal_answer:
        "Self-attention uses Query, Key, and Value matrices to determine how much attention each token should give to other tokens. Attention weights are computed using similarity scores, allowing the model to capture context and process sequences in parallel.",

      must_have_keywords: [
        "self-attention",
        "query",
        "key",
        "value",
        "attention weights",
        "parallelization",
        "context"
      ],

      common_mistakes: [
        "Ignoring QKV",
        "Not explaining attention weights",
        "No mention of context"
      ],

      rating_guide: {
        1: "Cannot explain self-attention.",
        2: "Knows it focuses on words.",
        3: "Mentions QKV.",
        4: "Explains attention scores.",
        5: "Explains QKV, weights, context, and parallel processing."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "GenAI",
      core_question: "What is RAG (Retrieval-Augmented Generation) and why use it?",
      sub_questions: [
        "Combining LLM with external knowledge base",
        "Reduces hallucinations",
        "Keeps information up-to-date"
      ],

      ideal_answer:
        "RAG combines an LLM with an external knowledge base by retrieving relevant information before generation. This reduces hallucinations and allows responses to use up-to-date information without retraining the model.",

      must_have_keywords: [
        "RAG",
        "LLM",
        "retrieval",
        "knowledge base",
        "hallucinations",
        "up-to-date"
      ],

      common_mistakes: [
        "Confusing RAG with fine-tuning",
        "Ignoring retrieval step",
        "Not mentioning hallucinations"
      ],

      rating_guide: {
        1: "Cannot explain RAG.",
        2: "Knows it uses external data.",
        3: "Mentions retrieval and LLM.",
        4: "Explains hallucination reduction.",
        5: "Explains retrieval, external knowledge, and benefits."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Optimization",
      core_question: "How does Gradient Descent work and what is learning rate?",
      sub_questions: [
        "Iterative optimization algorithm",
        "Moving opposite to gradient",
        "Step size control"
      ],

      ideal_answer:
        "Gradient Descent is an iterative optimization algorithm that updates model parameters in the direction opposite to the gradient to minimize loss. The learning rate controls the step size of each update.",

      must_have_keywords: [
        "gradient descent",
        "optimization",
        "loss function",
        "gradient",
        "learning rate",
        "step size"
      ],

      common_mistakes: [
        "Wrong update direction",
        "Ignoring learning rate",
        "No mention of optimization"
      ],

      rating_guide: {
        1: "Cannot explain gradient descent.",
        2: "Knows it optimizes models.",
        3: "Mentions gradients.",
        4: "Explains update direction.",
        5: "Explains optimization process and learning rate."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Deep Learning",
      core_question: "What is the vanishing gradient problem and how do we solve it?",
      sub_questions: [
        "Gradients becoming too small in deep networks",
        "Use of ReLU",
        "ResNets/Skip connections"
      ],

      ideal_answer:
        "The vanishing gradient problem occurs when gradients become extremely small during backpropagation in deep neural networks, slowing learning. Common solutions include ReLU activation functions and ResNet skip connections.",

      must_have_keywords: [
        "vanishing gradient",
        "backpropagation",
        "deep networks",
        "ReLU",
        "ResNet",
        "skip connections"
      ],

      common_mistakes: [
        "Confusing with exploding gradients",
        "Ignoring solutions",
        "No mention of deep networks"
      ],

      rating_guide: {
        1: "Cannot explain vanishing gradients.",
        2: "Basic understanding only.",
        3: "Mentions small gradients.",
        4: "Mentions ReLU.",
        5: "Explains cause and multiple solutions."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "LLM Fine-tuning",
      core_question: "Explain LoRA (Low-Rank Adaptation) for fine-tuning LLMs.",
      sub_questions: [
        "Freezing pre-trained model weights",
        "Injecting trainable rank decomposition matrices",
        "Reduces compute requirements"
      ],

      ideal_answer:
        "LoRA fine-tunes LLMs by freezing the original model weights and introducing small trainable low-rank matrices. This significantly reduces memory usage and computational cost while maintaining strong performance.",

      must_have_keywords: [
        "LoRA",
        "freeze weights",
        "low-rank matrices",
        "fine-tuning",
        "reduced compute",
        "parameter efficient"
      ],

      common_mistakes: [
        "Calling it full fine-tuning",
        "Ignoring frozen weights",
        "Not mentioning efficiency"
      ],

      rating_guide: {
        1: "Cannot explain LoRA.",
        2: "Knows it fine-tunes models.",
        3: "Mentions frozen weights.",
        4: "Mentions low-rank matrices.",
        5: "Explains mechanism and efficiency benefits."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    }
  ]
},
Cyber: {
  Beginner: [
    {
      topic: "Networking Basics",
      core_question: "What is the difference between TCP and UDP?",
      sub_questions: [
        "Connection-oriented vs connectionless",
        "Reliability mechanism",
        "Use cases (web/email vs streaming/gaming)"
      ],

      ideal_answer:
        "TCP is a connection-oriented protocol that provides reliable data delivery through acknowledgments and retransmissions. UDP is connectionless and prioritizes speed over reliability. TCP is commonly used for web browsing and email, while UDP is preferred for streaming, gaming, and real-time communication.",

      must_have_keywords: [
        "TCP",
        "UDP",
        "connection-oriented",
        "connectionless",
        "reliable",
        "acknowledgment",
        "retransmission",
        "streaming",
        "gaming"
      ],

      common_mistakes: [
        "Saying UDP is always better",
        "Ignoring reliability differences",
        "No use cases mentioned"
      ],

      rating_guide: {
        1: "Cannot differentiate TCP and UDP.",
        2: "Knows only one protocol.",
        3: "Mentions connection-oriented vs connectionless.",
        4: "Explains reliability differences.",
        5: "Explains reliability, mechanisms, and use cases."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Cryptography",
      core_question: "Explain symmetric vs asymmetric encryption.",
      sub_questions: [
        "Single key vs public/private key pair",
        "Speed differences",
        "Example algorithms (AES vs RSA)"
      ],

      ideal_answer:
        "Symmetric encryption uses a single shared key for encryption and decryption, making it fast and efficient. Asymmetric encryption uses a public-private key pair and is generally slower. AES is a common symmetric algorithm, while RSA is a common asymmetric algorithm.",

      must_have_keywords: [
        "symmetric",
        "asymmetric",
        "single key",
        "public key",
        "private key",
        "AES",
        "RSA"
      ],

      common_mistakes: [
        "Mixing up AES and RSA",
        "Ignoring key differences",
        "No speed comparison"
      ],

      rating_guide: {
        1: "Cannot explain encryption types.",
        2: "Knows only one type.",
        3: "Mentions key differences.",
        4: "Mentions AES and RSA.",
        5: "Explains keys, speed, and examples."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Web Security",
      core_question: "What is SQL Injection and how is it prevented?",
      sub_questions: [
        "Malicious SQL statements in input",
        "Use parameterized queries",
        "Input validation and sanitization"
      ],

      ideal_answer:
        "SQL Injection occurs when an attacker injects malicious SQL commands through user input. It can be prevented using parameterized queries, prepared statements, input validation, and proper sanitization.",

      must_have_keywords: [
        "SQL Injection",
        "malicious SQL",
        "user input",
        "parameterized queries",
        "prepared statements",
        "validation",
        "sanitization"
      ],

      common_mistakes: [
        "Only mentioning validation",
        "Ignoring prepared statements",
        "Not defining the attack"
      ],

      rating_guide: {
        1: "Cannot explain SQL Injection.",
        2: "Knows it is a database attack.",
        3: "Explains malicious input.",
        4: "Mentions parameterized queries.",
        5: "Explains attack and prevention techniques."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Authentication",
      core_question: "What is Multi-Factor Authentication (MFA)?",
      sub_questions: [
        "Requires more than one piece of evidence",
        "Something you know, have, or are",
        "Increases security posture"
      ],

      ideal_answer:
        "Multi-Factor Authentication requires two or more authentication factors. These factors typically include something you know, something you have, or something you are. MFA significantly improves account security.",

      must_have_keywords: [
        "MFA",
        "authentication factors",
        "something you know",
        "something you have",
        "something you are",
        "security"
      ],

      common_mistakes: [
        "Confusing MFA with strong passwords",
        "Not mentioning multiple factors",
        "No security benefit"
      ],

      rating_guide: {
        1: "Cannot explain MFA.",
        2: "Knows it improves security.",
        3: "Mentions multiple factors.",
        4: "Explains factor categories.",
        5: "Clearly explains factors and benefits."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Malware",
      core_question: "Explain what Ransomware is and how it impacts an organization.",
      sub_questions: [
        "Encrypts files and demands payment",
        "Loss of data availability",
        "Importance of backups"
      ],

      ideal_answer:
        "Ransomware is malware that encrypts files or systems and demands payment for recovery. It impacts organizations by causing loss of data availability, operational disruption, and financial damage. Regular backups are a critical defense.",

      must_have_keywords: [
        "ransomware",
        "encrypts files",
        "payment",
        "data availability",
        "backup",
        "recovery"
      ],

      common_mistakes: [
        "Calling it a virus only",
        "Ignoring encryption",
        "Not mentioning backups"
      ],

      rating_guide: {
        1: "Cannot explain ransomware.",
        2: "Knows it is malware.",
        3: "Mentions encryption.",
        4: "Explains organizational impact.",
        5: "Explains attack, impact, and mitigation."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    }
  ],

  Advanced: [
    {
      topic: "Network Security",
      core_question: "How does a Man-in-the-Middle (MitM) attack work on a Wi-Fi network?",
      sub_questions: [
        "ARP spoofing or DNS spoofing",
        "Intercepting communications",
        "Use of HTTPS/VPN to mitigate"
      ],

      ideal_answer:
        "In a Man-in-the-Middle attack, an attacker positions themselves between communicating parties using techniques such as ARP spoofing or DNS spoofing. This allows interception or modification of traffic. HTTPS and VPNs help mitigate these attacks.",

      must_have_keywords: [
        "MitM",
        "ARP spoofing",
        "DNS spoofing",
        "intercept traffic",
        "HTTPS",
        "VPN"
      ],

      common_mistakes: [
        "Not explaining interception",
        "Ignoring attack techniques",
        "No mitigation mentioned"
      ],

      rating_guide: {
        1: "Cannot explain MitM.",
        2: "Knows attacker intercepts traffic.",
        3: "Mentions spoofing techniques.",
        4: "Explains interception process.",
        5: "Explains attack and mitigation."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Application Security",
      core_question: "Describe exactly what Cross-Site Request Forgery (CSRF) is.",
      sub_questions: [
        "Forcing user to execute unwanted actions",
        "Exploits trust site has in user's browser",
        "Anti-CSRF tokens"
      ],

      ideal_answer:
        "CSRF is an attack that tricks an authenticated user into performing unintended actions on a trusted website. It exploits the trust a website places in a user's browser. Anti-CSRF tokens are commonly used as protection.",

      must_have_keywords: [
        "CSRF",
        "authenticated user",
        "unwanted actions",
        "trusted website",
        "browser trust",
        "anti-CSRF token"
      ],

      common_mistakes: [
        "Confusing CSRF with XSS",
        "Ignoring authentication requirement",
        "No mitigation mentioned"
      ],

      rating_guide: {
        1: "Cannot explain CSRF.",
        2: "Knows it is a web attack.",
        3: "Mentions forced actions.",
        4: "Mentions browser trust.",
        5: "Explains attack and mitigation."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Cryptography",
      core_question: "What is Forward Secrecy in the context of TLS?",
      sub_questions: [
        "Compromise of long-term keys does not compromise past session keys",
        "Use of ephemeral key exchange (e.g. ECDHE)",
        "Generates unique session keys"
      ],

      ideal_answer:
        "Forward Secrecy ensures that compromise of a server's long-term private key does not expose previously recorded sessions. It is achieved using ephemeral key exchange methods such as ECDHE, which generate unique session keys.",

      must_have_keywords: [
        "Forward Secrecy",
        "TLS",
        "long-term key",
        "session key",
        "ECDHE",
        "ephemeral"
      ],

      common_mistakes: [
        "Confusing with encryption",
        "Ignoring session keys",
        "No mention of ECDHE"
      ],

      rating_guide: {
        1: "Cannot explain Forward Secrecy.",
        2: "Knows it improves TLS security.",
        3: "Mentions session protection.",
        4: "Mentions ephemeral keys.",
        5: "Explains key compromise protection and ECDHE."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Incident Response",
      core_question: "What are the standard phases of incident response?",
      sub_questions: [
        "Preparation",
        "Identification and Containment",
        "Eradication, Recovery, and Lessons Learned"
      ],

      ideal_answer:
        "The standard incident response lifecycle consists of Preparation, Identification, Containment, Eradication, Recovery, and Lessons Learned. These phases help organizations effectively manage and improve their response to security incidents.",

      must_have_keywords: [
        "Preparation",
        "Identification",
        "Containment",
        "Eradication",
        "Recovery",
        "Lessons Learned"
      ],

      common_mistakes: [
        "Missing phases",
        "Wrong sequence",
        "Ignoring lessons learned"
      ],

      rating_guide: {
        1: "Cannot list phases.",
        2: "Lists some phases.",
        3: "Lists most phases.",
        4: "Lists all phases.",
        5: "Lists all phases and explains purpose."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Zero Trust",
      core_question: "Explain the Zero Trust security model.",
      sub_questions: [
        "Never trust, always verify",
        "Micro-segmentation",
        "Identity-based access control"
      ],

      ideal_answer:
        "Zero Trust follows the principle of 'Never Trust, Always Verify'. Every user and device must be continuously authenticated and authorized. The model relies on identity-based access control and micro-segmentation to reduce risk.",

      must_have_keywords: [
        "Zero Trust",
        "Never Trust Always Verify",
        "identity-based access",
        "authentication",
        "authorization",
        "micro-segmentation"
      ],

      common_mistakes: [
        "Assuming internal network is trusted",
        "Ignoring identity verification",
        "No mention of segmentation"
      ],

      rating_guide: {
        1: "Cannot explain Zero Trust.",
        2: "Basic security explanation.",
        3: "Mentions verification.",
        4: "Mentions identity-based access.",
        5: "Explains principle, access control, and segmentation."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    }
  ]
},
  DevOps: {
  Beginner: [
    {
      topic: "Version Control",
      core_question: "What is the difference between git merge and git rebase?",
      sub_questions: [
        "Merge preserves history",
        "Rebase rewrites history for a linear path",
        "When to use each"
      ],

      ideal_answer:
        "git merge combines branches while preserving branch history. git rebase moves commits onto a new base branch and creates a linear history. Merge is preferred for preserving context, while rebase is useful for maintaining a clean commit history.",

      must_have_keywords: [
        "git merge",
        "git rebase",
        "preserve history",
        "linear history",
        "branch",
        "commits"
      ],

      common_mistakes: [
        "Saying merge and rebase are identical",
        "Ignoring history differences",
        "Not mentioning use cases"
      ],

      rating_guide: {
        1: "Cannot explain merge or rebase.",
        2: "Knows both commands exist.",
        3: "Mentions history differences.",
        4: "Explains linear vs preserved history.",
        5: "Explains functionality and appropriate use cases."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "CI/CD",
      core_question: "Explain what Continuous Integration is.",
      sub_questions: [
        "Frequent merging of code changes",
        "Automated builds and tests",
        "Early bug detection"
      ],

      ideal_answer:
        "Continuous Integration is the practice of frequently merging code into a shared repository. Automated builds and tests run on each change, allowing teams to detect bugs early and maintain code quality.",

      must_have_keywords: [
        "Continuous Integration",
        "shared repository",
        "automated tests",
        "builds",
        "frequent commits",
        "early bug detection"
      ],

      common_mistakes: [
        "Confusing CI with CD",
        "Ignoring automation",
        "Not mentioning testing"
      ],

      rating_guide: {
        1: "Cannot explain CI.",
        2: "Knows it relates to deployment.",
        3: "Mentions code integration.",
        4: "Mentions automated testing.",
        5: "Explains integration, testing, and benefits."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Containerization",
      core_question: "What is Docker and why is it useful?",
      sub_questions: [
        "Packages code and dependencies",
        "Ensures consistency across environments",
        "More lightweight than VMs"
      ],

      ideal_answer:
        "Docker is a containerization platform that packages applications along with their dependencies. It ensures consistent behavior across environments and is more lightweight than traditional virtual machines.",

      must_have_keywords: [
        "Docker",
        "container",
        "dependencies",
        "consistency",
        "lightweight",
        "virtual machine"
      ],

      common_mistakes: [
        "Calling Docker a VM",
        "Ignoring dependencies",
        "Not explaining consistency"
      ],

      rating_guide: {
        1: "Cannot explain Docker.",
        2: "Knows it runs applications.",
        3: "Mentions containers.",
        4: "Mentions dependencies and consistency.",
        5: "Explains containers, consistency, and VM comparison."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Infrastructure as Code",
      core_question: "What are the benefits of using tools like Terraform?",
      sub_questions: [
        "Managing infra through declarative code",
        "Version controlling infrastructure",
        "Reproducible environments"
      ],

      ideal_answer:
        "Terraform enables Infrastructure as Code using declarative configurations. Infrastructure can be version controlled, automated, and reproduced consistently across multiple environments.",

      must_have_keywords: [
        "Terraform",
        "Infrastructure as Code",
        "declarative",
        "version control",
        "automation",
        "reproducible"
      ],

      common_mistakes: [
        "Treating Terraform as configuration management",
        "Ignoring reproducibility",
        "Not mentioning version control"
      ],

      rating_guide: {
        1: "Cannot explain Terraform.",
        2: "Knows it provisions resources.",
        3: "Mentions Infrastructure as Code.",
        4: "Mentions version control.",
        5: "Explains automation, reproducibility, and IaC."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Monitoring",
      core_question: "Why is centralized logging important in a microservices architecture?",
      sub_questions: [
        "Troubleshooting across multiple services",
        "Aggregation of logs in one place (e.g. ELK)",
        "Correlation IDs"
      ],

      ideal_answer:
        "Centralized logging collects logs from multiple services into a single platform such as ELK. It simplifies troubleshooting, improves observability, and enables request tracing using correlation IDs.",

      must_have_keywords: [
        "centralized logging",
        "microservices",
        "ELK",
        "aggregation",
        "troubleshooting",
        "correlation ID"
      ],

      common_mistakes: [
        "Ignoring distributed systems",
        "No mention of log aggregation",
        "Ignoring correlation IDs"
      ],

      rating_guide: {
        1: "Cannot explain centralized logging.",
        2: "Knows logs are useful.",
        3: "Mentions aggregation.",
        4: "Mentions troubleshooting benefits.",
        5: "Explains aggregation, tracing, and observability."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    }
  ],

  Advanced: [
    {
      topic: "Kubernetes",
      core_question: "Explain the function of a Kubernetes Ingress.",
      sub_questions: [
        "Manages external access to services",
        "Provides load balancing and SSL termination",
        "Name-based virtual hosting"
      ],

      ideal_answer:
        "A Kubernetes Ingress manages external access to services within a cluster. It provides routing, load balancing, SSL/TLS termination, and supports host-based or path-based routing.",

      must_have_keywords: [
        "Ingress",
        "external access",
        "routing",
        "load balancing",
        "SSL termination",
        "host-based routing"
      ],

      common_mistakes: [
        "Confusing Ingress with Service",
        "Ignoring routing capabilities",
        "Not mentioning SSL"
      ],

      rating_guide: {
        1: "Cannot explain Ingress.",
        2: "Knows it exposes applications.",
        3: "Mentions routing.",
        4: "Mentions load balancing.",
        5: "Explains routing, SSL, and external access."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Cloud Architecture",
      core_question: "How do you design a highly available system on AWS?",
      sub_questions: [
        "Multi-AZ deployment",
        "Auto-scaling groups",
        "Load balancers"
      ],

      ideal_answer:
        "A highly available AWS architecture uses Multi-AZ deployments, Load Balancers to distribute traffic, and Auto Scaling Groups to automatically adjust capacity and handle failures.",

      must_have_keywords: [
        "AWS",
        "Multi-AZ",
        "Load Balancer",
        "Auto Scaling",
        "high availability",
        "fault tolerance"
      ],

      common_mistakes: [
        "Using a single availability zone",
        "Ignoring load balancing",
        "Ignoring scaling"
      ],

      rating_guide: {
        1: "Cannot explain high availability.",
        2: "Mentions AWS services only.",
        3: "Mentions Multi-AZ.",
        4: "Mentions scaling and balancing.",
        5: "Explains complete highly available architecture."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "CI/CD Pipelines",
      core_question: "Describe a blue-green deployment strategy.",
      sub_questions: [
        "Two identical environments",
        "Routing traffic from old to new immediately",
        "Easy rollback capability"
      ],

      ideal_answer:
        "Blue-Green deployment uses two identical environments. Traffic is switched from the current environment to the new version after validation. If issues occur, traffic can quickly be routed back for rollback.",

      must_have_keywords: [
        "blue-green",
        "two environments",
        "traffic switch",
        "rollback",
        "deployment"
      ],

      common_mistakes: [
        "Confusing with canary deployment",
        "Ignoring rollback benefits",
        "Not mentioning two environments"
      ],

      rating_guide: {
        1: "Cannot explain blue-green deployment.",
        2: "Knows it is a deployment strategy.",
        3: "Mentions two environments.",
        4: "Explains traffic switching.",
        5: "Explains switching and rollback advantages."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Observability",
      core_question: "What is the difference between monitoring and observability?",
      sub_questions: [
        "Monitoring tells you a system is broken",
        "Observability helps you figure out why",
        "Logs, metrics, traces combination"
      ],

      ideal_answer:
        "Monitoring detects and alerts when something goes wrong. Observability helps identify why it happened by analyzing logs, metrics, and traces together.",

      must_have_keywords: [
        "monitoring",
        "observability",
        "logs",
        "metrics",
        "traces",
        "root cause"
      ],

      common_mistakes: [
        "Using both terms interchangeably",
        "Ignoring traces",
        "No root cause discussion"
      ],

      rating_guide: {
        1: "Cannot differentiate the concepts.",
        2: "Basic understanding only.",
        3: "Mentions alerts.",
        4: "Mentions root cause analysis.",
        5: "Clearly explains monitoring vs observability using logs, metrics, and traces."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    },

    {
      topic: "Microservices",
      core_question: "What is the Saga pattern in microservices and why is it needed?",
      sub_questions: [
        "Managing distributed transactions",
        "Sequence of local transactions",
        "Compensating transactions on failure"
      ],

      ideal_answer:
        "The Saga pattern manages distributed transactions across multiple microservices. Each service performs a local transaction, and if a failure occurs, compensating transactions are executed to maintain consistency.",

      must_have_keywords: [
        "Saga",
        "distributed transaction",
        "local transaction",
        "compensating transaction",
        "microservices",
        "consistency"
      ],

      common_mistakes: [
        "Treating Saga as database replication",
        "Ignoring compensating actions",
        "Not mentioning distributed transactions"
      ],

      rating_guide: {
        1: "Cannot explain Saga.",
        2: "Knows it relates to microservices.",
        3: "Mentions distributed transactions.",
        4: "Mentions local transactions.",
        5: "Explains distributed consistency and compensating transactions."
      },

      evaluation_weights: {
        keyword_match: 40,
        conceptual_correctness: 40,
        clarity: 10,
        example_usage: 10
      }
    }
  ]
},
  Resume: {
  Beginner: [
    {
      topic: "Resume",

      core_question:
        "Which project on your resume are you most proud of and why?",

      sub_questions: [
        "What would you improve if you had more time on your project?"
      ],

      ideal_answer:
        "The project I am most proud of is my AI-powered study platform. The goal was to help students collaborate and learn more effectively through shared study rooms, synchronized timers, AI-generated notes, quizzes, and flashcards. I built it using React, Node.js, MongoDB, Socket.IO, and Gemini API. One major challenge was maintaining real-time synchronization across multiple users, which I solved using WebSockets. The project improved my understanding of system design, real-time communication, and AI integration. If given more time, I would add personalized learning analytics and recommendation systems.",

      must_have_keywords: [
        "problem solved",
        "technology stack",
        "challenge",
        "solution",
        "impact",
        "improvement"
      ],

      common_mistakes: [
        "Only describing features",
        "No technical challenge",
        "No technologies mentioned",
        "No future improvements"
      ],

      rating_guide: {
        1: "Cannot explain project.",
        2: "Lists project features only.",
        3: "Explains project and technologies.",
        4: "Explains challenge and solution.",
        5: "Explains problem, stack, challenge, impact, and future improvements."
      },

      evaluation_weights: {
        project_depth: 35,
        technical_clarity: 30,
        impact: 20,
        communication: 15
      }
    },

    {
      topic: "How u resolve issues",

      core_question:
        "How do you approach debugging a complex issue?",

      sub_questions: [
        "What steps do you take to diagnose a problem?",
        "What tools do you use?",
        "How do you test your solution?",
        "How do you document the issue and solution?"
      ],

      ideal_answer:
        "I follow a structured approach. First, I reproduce the issue consistently. For example, while building a Streamlit-based AI application, I encountered dependency conflicts that caused deployment failures. I checked logs, reviewed package versions, and isolated the root cause. I then fixed the dependency mismatch, validated the solution locally and in staging, and documented the issue in GitHub along with the resolution steps. This approach helps prevent similar issues in the future.",

      must_have_keywords: [
        "reproduce",
        "logs",
        "root cause",
        "testing",
        "documentation",
        "GitHub"
      ],

      common_mistakes: [
        "Jumping directly to a fix",
        "No root cause analysis",
        "No testing",
        "No documentation"
      ],

      rating_guide: {
        1: "Random troubleshooting.",
        2: "Mentions debugging only.",
        3: "Uses logs and testing.",
        4: "Explains root cause analysis.",
        5: "Uses systematic debugging process with validation and documentation."
      },

      evaluation_weights: {
        methodology: 40,
        technical_depth: 30,
        communication: 15,
        learning: 15
      }
    },

    {
      topic: "How u work in team",

      core_question:
        "How do you handle with difference in opinions in a team?",

      sub_questions: [
        "What steps do you take to resolve conflicts?",
        "How do you communicate your perspective while respecting others?"
      ],

      ideal_answer:
        "I focus on data-driven discussions rather than personal opinions. During a team project, there was a disagreement about whether to use REST APIs or WebSockets for real-time updates. I listened to everyone's concerns, created a small prototype, and compared performance and scalability. Based on the results, the team agreed to use WebSockets. This approach helped us make an objective decision while maintaining a positive team environment.",

      must_have_keywords: [
        "listen",
        "data-driven",
        "prototype",
        "objective decision",
        "team collaboration"
      ],

      common_mistakes: [
        "Blaming teammates",
        "Avoiding conflict",
        "No example"
      ],

      rating_guide: {
        1: "Handles conflict poorly.",
        2: "Generic teamwork answer.",
        3: "Mentions communication.",
        4: "Uses evidence-based decisions.",
        5: "Provides real example and resolution strategy."
      },

      evaluation_weights: {
        teamwork: 35,
        communication: 35,
        problem_solving: 20,
        professionalism: 10
      }
    },

    {
      topic: "Technical skills",

      core_question:
        "How do you keep your technical skills updated?",

      sub_questions: [
        "What resources do you use?",
        "How do you stay updated with new technologies?",
        "How do you apply what you learn to your work?"
      ],

      ideal_answer:
        "I regularly follow official documentation, GitHub repositories, research papers, technical blogs, and developer communities. For example, while learning Generative AI and RAG systems, I studied research papers, explored open-source projects, and implemented those concepts in my own AI applications. I believe applying new concepts through projects is the most effective way to learn.",

      must_have_keywords: [
        "documentation",
        "GitHub",
        "research papers",
        "projects",
        "continuous learning"
      ],

      common_mistakes: [
        "Only watching videos",
        "No practical application",
        "No examples"
      ],

      rating_guide: {
        1: "No learning strategy.",
        2: "Mentions courses only.",
        3: "Uses multiple resources.",
        4: "Applies learning in projects.",
        5: "Shows continuous learning with practical implementation."
      },

      evaluation_weights: {
        learning_mindset: 40,
        application: 35,
        communication: 15,
        initiative: 10
      }
    },

    {
      topic: "Handling Failure",

      core_question:
        "Describe a situation where your technical solution failed or didn’t perform as expected. How did you diagnose the issue, and what changes did you implement afterward?",

      sub_questions: [
        "What was the initial problem you were trying to solve?",
        "What was your proposed solution?"
      ],

      ideal_answer:
        "While developing an AI-based recommendation feature, my initial model achieved high training accuracy but poor real-world performance. After analyzing evaluation metrics and validation results, I discovered overfitting. I implemented regularization, improved feature engineering, and introduced cross-validation. This significantly improved generalization. The experience taught me the importance of evaluating models beyond training accuracy.",

      must_have_keywords: [
        "failure",
        "analysis",
        "root cause",
        "overfitting",
        "improvement",
        "lesson learned"
      ],

      common_mistakes: [
        "Claiming no failures",
        "Blaming others",
        "No learning outcome"
      ],

      rating_guide: {
        1: "Cannot discuss failure.",
        2: "Describes failure only.",
        3: "Identifies cause.",
        4: "Implements solution.",
        5: "Explains failure, diagnosis, fix, and learning."
      },

      evaluation_weights: {
        ownership: 30,
        technical_depth: 30,
        learning: 25,
        communication: 15
      }
    },

    {
      topic: "Conflict Resolution",

      core_question:
        "How do you handle disagreements or conflicts within a technical team?",

      sub_questions: [
        "What steps do you take to resolve conflicts?",
        "How do you communicate your perspective while respecting others?",
        "How do you ensure that conflicts don’t negatively impact project outcomes?"
      ],

      ideal_answer:
        "I focus on understanding the reasoning behind each perspective and align discussions with project goals. During a collaborative project, team members disagreed on database selection. Instead of debating opinions, I suggested comparing scalability, query performance, and maintenance requirements. After evaluating the options, the team reached a consensus. This ensured the discussion remained constructive and project progress was not affected.",

      must_have_keywords: [
        "active listening",
        "project goals",
        "objective evaluation",
        "consensus",
        "respectful communication"
      ],

      common_mistakes: [
        "Personal arguments",
        "Ignoring feedback",
        "No conflict resolution process"
      ],

      rating_guide: {
        1: "Cannot handle conflicts.",
        2: "Generic answer.",
        3: "Mentions communication.",
        4: "Uses objective evaluation.",
        5: "Provides real scenario and constructive resolution."
      },

      evaluation_weights: {
        teamwork: 35,
        communication: 30,
        leadership: 20,
        professionalism: 15
      }
    }
  ]
}
}