export const lessons = [
  {
    id: "stress",
    subject: "MECHANICS",
    title: "Stress & strain",
    short: "When does a material spring back?",
    duration: "6 min",
    color: "peach",
    symbol: "↗",
    intro:
      "Two materials can look the same under a load, yet behave very differently when you let go. Explain what the curve tells us.",
    notes: [
      {
        title: "Stress and strain",
        text: "Engineering stress is force divided by original cross-sectional area (σ = F/A₀). Engineering strain is change in length divided by original length (ε = ΔL/L₀); strain is dimensionless.",
      },
      {
        title: "Stiffness is a slope",
        text: "In the linear elastic region, stress is proportional to strain. Young’s modulus E is the slope of that region on a stress-versus-strain graph. A steeper slope means greater stiffness, not necessarily greater strength.",
      },
      {
        title: "Elastic versus plastic",
        text: "Elastic deformation is recoverable when a load is removed. Beyond yield, plastic deformation leaves a permanent change in shape. Yield strength and ultimate tensile strength describe different limits; stiffness alone does not determine either.",
      },
    ],
    questions: [
      "If you double the cross-sectional area while keeping the force the same, what happens to stress? Why?",
      "Material A has a steeper initial stress–strain slope than B. Does that prove A has a higher breaking strength? Explain the distinction.",
      "You stretch a specimen past its yield point and release it. Will it return completely to its original length? Why?",
    ],
    criteria: [
      {
        label: "Stress relates force to area",
        note: 0,
        patterns: [
          /force[\s\S]{0,65}(divid|over|per)[\s\S]{0,35}area/,
          /stress[\s\S]{0,45}(halv|half)/,
          /σ\s*=\s*f\s*\/\s*a/,
        ],
        correction:
          "Stress is force divided by cross-sectional area. At fixed force, doubling area halves stress.",
      },
      {
        label: "Stiffness and strength are different",
        note: 1,
        patterns: [
          /(young|modulus|slope)[\s\S]{0,70}stiff/,
          /stiff[\s\S]{0,80}(not|doesn.t|different|distinct|cannot|can.t)[\s\S]{0,50}strength/,
          /not necessarily[\s\S]{0,40}(strong|strength)/,
        ],
        correction:
          "The initial slope measures stiffness. It does not establish breaking strength.",
      },
      {
        label: "Plastic deformation leaves a permanent change",
        note: 2,
        patterns: [
          /(plastic|yield)[\s\S]{0,90}(permanent|won.t return|not return|does not return|cannot return)/,
          /permanent[\s\S]{0,60}(deform|change|strain|length)/,
        ],
        correction:
          "After yielding, unloading recovers the elastic component but leaves permanent plastic strain.",
      },
    ],
    misconceptions: [
      {
        pattern:
          /(steeper|stiffer)[\s\S]{0,25}(means|is always|proves|must be)[\s\S]{0,25}(stronger|higher strength)/,
        text: "A steeper elastic slope does not prove higher strength.",
        criterion: 1,
      },
      {
        pattern:
          /(past|beyond|after)[\s\S]{0,20}yield[\s\S]{0,55}(completely returns|fully returns|returns completely|always returns)/,
        text: "Past yield, the specimen retains permanent deformation.",
        criterion: 2,
      },
    ],
    sample:
      "Stress is how much force a material experiences. A steeper curve means the material must be stronger. After you stretch it past yield, it always returns to its original length.",
    challenge:
      "A bridge component can be stiff without being the strongest. Test three predictions before you trust the curve.",
    steps: [
      {
        title: "Same force. More area.",
        answer:
          "The stress halves. Engineering stress is force divided by the original cross-sectional area, so σ = F/A₀. At fixed force, twice the area gives half the stress.",
        why: "Force is the total load. Stress describes how concentrated that load is across the section. Comparing force alone misses the area carrying it.",
        misconception:
          "“The force is unchanged, so the stress is unchanged.” That leaves out the area in F/A₀.",
        workedExample:
          "A 100 N force over 10 mm² gives 10 N/mm², or 10 MPa. The same force over 20 mm² gives 5 MPa.",
        hint: "Write stress as a fraction. Which part of F/A₀ changes, and what happens when its denominator doubles?",
        checkpoint: {
          question:
            "A specimen carries 200 N over an original cross-sectional area of 20 mm². What is its engineering stress?",
          options: ["5 MPa", "10 MPa", "20 MPa", "4,000 MPa"],
          answer: 1,
          explanation:
            "200 N ÷ 20 mm² = 10 N/mm² = 10 MPa. Use force divided by area, not force multiplied by area.",
        },
      },
      {
        title: "Stiffness is not strength.",
        answer:
          "No. A steeper initial stress–strain slope means a larger Young’s modulus and greater stiffness in the linear elastic region. It does not establish the material’s breaking strength.",
        why: "Stiffness describes resistance to elastic deformation. Strength describes a stress limit, such as yield stress or ultimate tensile stress. A slope and a limiting stress are different measurements.",
        misconception:
          "“The steeper curve must belong to the stronger material.” You need the relevant strength limit as well as the initial slope.",
        workedExample:
          "At 100 MPa within both linear elastic regions, a material with E = 200 GPa has strain 0.0005. One with E = 100 GPa has strain 0.001. This comparison shows stiffness; it does not tell you which breaks first.",
        hint: "What does the initial slope measure? Does the graph’s initial slope tell you where its curve ends?",
        checkpoint: {
          question:
            "Material A’s initial stress–strain slope is twice B’s. Which conclusion follows from that information alone?",
          options: [
            "A has twice the breaking strength",
            "A must yield at a higher stress",
            "A has twice the Young’s modulus",
            "A can never deform permanently",
          ],
          answer: 2,
          explanation:
            "Young’s modulus is the slope in the linear elastic region. The slope alone does not establish yield stress, breaking strength, or the absence of plastic deformation.",
        },
      },
      {
        title: "What remains when you let go?",
        answer:
          "It will not return completely to its original length. After yielding, unloading recovers the elastic part of the deformation but leaves permanent plastic strain.",
        why: "Elastic deformation is recoverable. Plastic deformation changes the specimen permanently, so removing the force does not undo all of the extension.",
        misconception:
          "“All stretching springs back once the load is removed.” That is only true for deformation that remains elastic.",
        workedExample:
          "A 100 mm gauge length is stretched to 105 mm. After unloading it measures 102 mm. The recovered 3 mm was elastic extension; the remaining 2 mm is permanent extension.",
        hint: "Separate the extension into a recoverable part and a permanent part. Which one is associated with plastic deformation?",
        checkpoint: {
          question:
            "A specimen starts at 100 mm and measures 102 mm after the load is removed. What permanent engineering strain remains?",
          options: ["0%", "2%", "3%", "5%"],
          answer: 1,
          explanation:
            "Permanent strain = (102 − 100) ÷ 100 = 0.02 = 2%. Use the unloaded length and the original gauge length.",
        },
      },
    ],
    transfer: {
      question:
        "Two rods have identical dimensions. A has twice the Young’s modulus of B. Under the same small tensile force, within both linear elastic regions, how does A’s extension compare?",
      options: [
        "A extends twice as much",
        "A extends half as much",
        "Both extend equally",
        "There is not enough information",
      ],
      answer: 1,
      explanation:
        "In the linear elastic region, ΔL = FL/(AE). With the same force and dimensions, doubling E halves extension.",
    },
  },
  {
    id: "probability",
    subject: "PROBABILITY",
    title: "Independent events",
    short: "Does a coin remember its last flip?",
    duration: "5 min",
    color: "lilac",
    symbol: "◒",
    intro:
      "A coin lands heads five times in a row. Your friend says tails is now due. Help them untangle what independence actually means.",
    notes: [
      {
        title: "Independence",
        text: "Events A and B are independent when knowing that A occurred does not change the probability of B. For a fair coin with independent flips, each next flip has probability 1/2 of heads, regardless of previous outcomes.",
      },
      {
        title: "Joint probability",
        text: "For independent events, P(A and B) = P(A) × P(B). Two specified heads in two independent fair flips have probability 1/4. A particular long sequence can be unlikely even though its next flip remains 50–50.",
      },
      {
        title: "The gambler’s fallacy",
        text: "A streak does not make the opposite outcome due on an independent trial. Mutually exclusive events cannot occur together; independent events do not influence each other’s probability. These are different ideas.",
      },
    ],
    questions: [
      "A fair coin lands heads five times. Assuming independent flips, what is the probability of heads next, and why?",
      "What is the probability of heads on BOTH of the next two independent fair flips? Explain how you calculated it.",
      "A friend says independent events cannot happen together. Is that right? What concept are they confusing with independence?",
    ],
    criteria: [
      {
        label: "Past flips do not change the next probability",
        note: 0,
        patterns: [
          /(1\/2|50\s?%|0\.5|half)[\s\S]{0,110}(independent|past|previous|change|memory)/,
          /(independent|past|previous|change|memory)[\s\S]{0,110}(1\/2|50\s?%|0\.5|half)/,
        ],
        correction:
          "The next heads probability stays 1/2; previous independent flips do not affect it.",
      },
      {
        label: "Multiply probabilities for independent joint events",
        note: 1,
        patterns: [
          /(1\/4|25\s?%|0\.25|quarter)[\s\S]{0,70}(multipl|times|×|\*)/,
          /(multipl|times|×|\*)[\s\S]{0,70}(1\/4|25\s?%|0\.25|quarter)/,
        ],
        correction: "For two independent heads, multiply 1/2 × 1/2 = 1/4.",
      },
      {
        label: "Independence differs from mutual exclusivity",
        note: 2,
        patterns: [
          /mutually exclusive/,
          /can[\s\S]{0,20}(happen|occur)[\s\S]{0,15}together/,
        ],
        correction:
          "Mutually exclusive events cannot occur together. Independent events leave each other’s probabilities unchanged.",
      },
    ],
    misconceptions: [
      {
        pattern: /(tails|opposite)[\s\S]{0,20}(is due|more likely|has to)/,
        text: "An independent coin flip does not compensate for a streak.",
        criterion: 0,
      },
    ],
    sample:
      "Independent means events cannot happen together. Since there have been five heads, tails is due and more likely next.",
    challenge:
      "A streak feels like a pattern. Find out when that feeling changes a prediction—and when it does not.",
    steps: [
      {
        title: "A streak does not create a debt.",
        answer:
          "The probability of heads on the next flip is still 1/2, or 50%. The coin is fair and the flips are independent, so the earlier outcomes do not change the next flip’s probability.",
        why: "Independence means information about earlier flips does not change the probability on this flip. A run of heads does not make tails “due.”",
        misconception:
          "“There have been too many heads, so tails is more likely next.” Independent trials do not compensate for earlier results.",
        workedExample:
          "Six heads in a row is an unusual specified sequence: its probability is (1/2)⁶. Once those flips have happened, the next independent fair flip still has a 1/2 chance of heads.",
        hint: "Does the setup say the coin changes, or only that its previous outcomes are known?",
        checkpoint: {
          question:
            "A biased coin has a fixed 70% chance of heads on each independent flip. After four tails, what is the probability of heads next?",
          options: ["50%", "70%", "30%", "More than 70%"],
          answer: 1,
          explanation:
            "It remains 70%. Independence keeps the next-flip probability unchanged; it does not require that the coin be fair.",
        },
      },
      {
        title: "“Both” means multiply here.",
        answer:
          "The probability is 1/4, or 25%. For the two independent fair flips, P(heads then heads) = 1/2 × 1/2.",
        why: "You need the first flip to be heads and the second flip to be heads. For independent events, their joint probability is the product of their probabilities.",
        misconception:
          "“Each flip is 50%, so two heads together is also 50%.” That confuses one event with the joint event that both requirements are met.",
        workedExample:
          "The four equally likely two-flip outcomes are HH, HT, TH, and TT. Only HH satisfies “heads on both flips,” so the probability is 1 out of 4.",
        hint: "List the two-flip outcomes, or multiply the chance of meeting each independent requirement.",
        checkpoint: {
          question:
            "You roll a fair six-sided die and independently flip a fair coin. What is the probability of a 6 and heads?",
          options: ["1/2", "1/6", "2/3", "1/12"],
          answer: 3,
          explanation:
            "Multiply the independent probabilities: 1/6 × 1/2 = 1/12. The question requires both outcomes.",
        },
      },
      {
        title: "Can happen together ≠ affect each other.",
        answer:
          "That statement confuses independence with mutual exclusivity. Mutually exclusive events cannot happen together. Independent events leave each other’s probabilities unchanged and can happen together.",
        why: "The two definitions ask different questions: “Can both occur?” and “Does knowing one occurred change the other’s probability?”",
        misconception:
          "“Independent means separate, so the events cannot happen together.” Being able to occur together does not establish dependence.",
        workedExample:
          "For independent fair flips, “heads on the first flip” and “heads on the second flip” can both happen. On one flip, “heads” and “tails” are mutually exclusive: observing one rules out the other.",
        hint: "Compare heads and tails on one flip with heads on two different independent flips.",
        checkpoint: {
          question:
            "On one roll of a fair die, event A is “roll a 2” and event B is “roll a 5.” How are A and B related?",
          options: [
            "Independent only",
            "Mutually exclusive only",
            "Both independent and mutually exclusive",
            "Neither",
          ],
          answer: 1,
          explanation:
            "A single roll cannot be both 2 and 5, so the events are mutually exclusive. Knowing A occurred makes B impossible, changing B’s probability from 1/6 to 0; they are not independent.",
        },
      },
    ],
    transfer: {
      question:
        "A fair six-sided die is rolled independently four times and shows 6 every time. What is the probability of a 6 on the next roll?",
      options: ["1 in 2", "1 in 6", "1 in 30", "Less than 1 in 6"],
      answer: 1,
      explanation:
        "It remains 1/6. The previous rolls do not change the probability on an independent roll.",
    },
  },
  {
    id: "economics",
    subject: "ECONOMICS",
    title: "Opportunity cost",
    short: "What does a “free” choice really cost?",
    duration: "5 min",
    color: "sage",
    symbol: "⇄",
    intro:
      "You have one free evening, a concert ticket, and an exam tomorrow. The price on the ticket is only part of the decision.",
    notes: [
      {
        title: "The next-best alternative",
        text: "Opportunity cost is the value of the next-best alternative forgone when making a choice. It is not the sum of every alternative you could imagine.",
      },
      {
        title: "More than money",
        text: "Opportunity cost can include time, learning, leisure, or earnings. A free event can have an opportunity cost if attending means giving up a valuable alternative.",
      },
      {
        title: "Sunk costs",
        text: "A sunk cost has already been incurred and cannot be recovered. For a forward-looking choice, compare future benefits and costs of the available options rather than letting an unrecoverable past payment decide for you.",
      },
    ],
    questions: [
      "You can either study, work a shift, or watch a movie tonight. If you study and the shift was your next-best option, what is your opportunity cost?",
      "A concert ticket is free. Does attending necessarily have zero opportunity cost? Explain with an alternative use of your time.",
      "You paid for a non-refundable ticket last month, but now prefer to study. Should that unrecoverable payment determine tonight’s choice? Why?",
    ],
    criteria: [
      {
        label: "Identify the next-best alternative",
        note: 0,
        patterns: [
          /next.best/,
          /(forgo|forgone|giving up|give up|lost|sacrific)[\s\S]{0,55}(shift|work|earn|wage)/,
          /(shift|work|earn|wage)[\s\S]{0,55}(forgo|forgone|giving up|give up|lost|sacrific)/,
        ],
        correction:
          "The opportunity cost is the value of your next-best alternative: in this case, the work shift.",
      },
      {
        label: "Recognize non-monetary costs",
        note: 1,
        patterns: [
          /(free|concert)[\s\S]{0,90}(time|study|studying|leisure)/,
          /(time|study|studying|leisure)[\s\S]{0,90}(free|concert)/,
        ],
        correction:
          "A free concert can cost you study time or another valuable use of the evening.",
      },
      {
        label: "Separate sunk costs from future choices",
        note: 2,
        patterns: [
          /sunk[\s\S]{0,80}(ignore|not|shouldn.t|future|recover|irrelevant)/,
          /(ignore|not|shouldn.t|future|recover|irrelevant)[\s\S]{0,80}sunk/,
        ],
        correction:
          "The unrecoverable payment is sunk. Compare future outcomes of studying and attending.",
      },
    ],
    misconceptions: [
      {
        pattern:
          /(free|zero.price)[\s\S]{0,35}(means|has|so)[\s\S]{0,20}(no|zero) opportunity cost/,
        text: "A zero price does not imply zero opportunity cost.",
        criterion: 1,
      },
    ],
    sample:
      "Opportunity cost is the sum of everything you could have done instead. A free concert has no opportunity cost, and you should attend a paid event just because you already bought the ticket.",
    challenge:
      "You cannot spend the same evening twice. Work out which alternative you actually give up—and which costs are already gone.",
    steps: [
      {
        title: "Name the alternative you give up.",
        answer:
          "Your opportunity cost is the value of the work shift, because it was your next-best available option. It is not the sum of the shift, movie, and every other possible use of the evening.",
        why: "Choosing study prevents you from taking your next-best option. Adding incompatible alternatives would count things you could not have done together anyway.",
        misconception:
          "“Opportunity cost is everything I could have done instead, added together.” Use the single next-best alternative.",
        workedExample:
          "Suppose your next-best option is a shift worth $150 to you, while a movie is worth $80. If you choose to study, the opportunity cost is the $150 shift, not $230.",
        hint: "If studying disappeared as an option, what would you actually choose next?",
        checkpoint: {
          question:
            "You value an internship task at $300, a personal project at $220, and relaxing at $100. You can choose only one. If you choose the internship task, what is the opportunity cost?",
          options: ["$0", "$100", "$220", "$320"],
          answer: 2,
          explanation:
            "The personal project is the next-best alternative at $220. Do not add the value of relaxing, because you could not choose both alternatives in that same time.",
        },
      },
      {
        title: "A zero price can still cost time.",
        answer:
          "No. A free ticket removes the ticket payment, but attending still uses time. If your next-best use of that time is studying, the opportunity cost includes the value of the study time you give up.",
        why: "Opportunity cost measures the value of an alternative forgone. That value can involve learning, rest, or earnings rather than a cash payment.",
        misconception:
          "“If no money leaves my account, there is no cost.” Time and other forgone benefits can matter even when the price is zero.",
        workedExample:
          "A free two-hour workshop conflicts with a two-hour shift worth $200 to you. If that shift is your next-best option, attending the workshop has a $200 opportunity cost despite its free ticket.",
        hint: "What valuable activity would occupy those same hours if you did not attend?",
        checkpoint: {
          question:
            "A free 90-minute webinar takes the time you would otherwise spend on your next-best option: practising for an interview. What is the relevant opportunity cost?",
          options: [
            "Zero, because the webinar is free",
            "The value of all possible activities combined",
            "The value of the interview practice forgone",
            "Only the cost of the internet connection",
          ],
          answer: 2,
          explanation:
            "The relevant alternative is the interview practice you give up. Its value need not be expressed as a cash payment.",
        },
      },
      {
        title: "A past payment cannot be changed tonight.",
        answer:
          "The unrecoverable payment should not determine tonight’s choice. It is a sunk cost. Compare the future benefits and costs of attending with those of studying, including any travel cost and the value of your time.",
        why: "If the ticket cannot be refunded or resold, the past payment is the same whether you attend or study. The options differ in what happens from now on.",
        misconception:
          "“I paid already, so attending must be the better decision.” Attending does not recover an unrecoverable payment.",
        workedExample:
          "You already paid $200 for a non-refundable, non-transferable ticket. From now on, attending gives you a benefit valued at $80 and costs $30 in travel, while studying is worth $100. The future comparison is $50 versus $100; the past $200 is sunk.",
        hint: "Which costs or benefits would actually change if you switched your decision now?",
        checkpoint: {
          question:
            "You already paid $100 for an unusable-by-others, non-refundable ticket. Attending now offers $40 of benefit and costs $30 in travel; studying is worth $80. Which reason supports choosing study?",
          options: [
            "Its $80 future value exceeds the $10 net future benefit of attending",
            "Studying will recover the $100 ticket payment",
            "The ticket price becomes a new benefit if you attend",
            "A sunk payment must always be followed by more spending",
          ],
          answer: 0,
          explanation:
            "Compare future outcomes: attending offers $40 − $30 = $10, while studying is worth $80. The $100 past payment cannot be recovered by either choice.",
        },
      },
    ],
    transfer: {
      question:
        "You can spend an hour tutoring for $150, working a shift for $100, or relaxing, which you value at $80. If you choose tutoring, what is the opportunity cost?",
      options: [
        "$0, because you earn money",
        "$80, the value of relaxing",
        "$100, the next-best alternative",
        "$180, both alternatives combined",
      ],
      answer: 2,
      explanation:
        "The next-best alternative is the $100 shift. Opportunity cost uses that alternative, not the sum of all alternatives.",
    },
  },
];
