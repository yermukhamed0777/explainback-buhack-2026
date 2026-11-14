export const lessons = [
  {
    id: 'stress', subject: 'MECHANICS', title: 'Stress & strain', short: 'When does a material spring back?', duration: '6 min', color: 'peach', symbol: '↗',
    intro: 'Two materials can look the same under a load, yet behave very differently when you let go. Explain what the curve tells us.',
    notes: [
      {title:'Stress and strain', text:'Engineering stress is force divided by original cross-sectional area (σ = F/A₀). Engineering strain is change in length divided by original length (ε = ΔL/L₀); strain is dimensionless.'},
      {title:'Stiffness is a slope', text:'In the linear elastic region, stress is proportional to strain. Young’s modulus E is the slope of that region on a stress-versus-strain graph. A steeper slope means greater stiffness, not necessarily greater strength.'},
      {title:'Elastic versus plastic', text:'Elastic deformation is recoverable when a load is removed. Beyond yield, plastic deformation leaves a permanent change in shape. Yield strength and ultimate tensile strength describe different limits; stiffness alone does not determine either.'}
    ],
    questions: [
      'If you double the cross-sectional area while keeping the force the same, what happens to stress? Why?',
      'Material A has a steeper initial stress–strain slope than B. Does that prove A has a higher breaking strength? Explain the distinction.',
      'You stretch a specimen past its yield point and release it. Will it return completely to its original length? Why?'
    ],
    criteria: [
      {label:'Stress relates force to area', note:0, patterns:[/force[\s\S]{0,65}(divid|over|per)[\s\S]{0,35}area/, /stress[\s\S]{0,45}(halv|half)/, /σ\s*=\s*f\s*\/\s*a/], correction:'Stress is force divided by cross-sectional area. At fixed force, doubling area halves stress.'},
      {label:'Stiffness and strength are different', note:1, patterns:[/(young|modulus|slope)[\s\S]{0,70}stiff/, /stiff[\s\S]{0,80}(not|doesn.t|different|distinct|cannot|can.t)[\s\S]{0,50}strength/, /not necessarily[\s\S]{0,40}(strong|strength)/], correction:'The initial slope measures stiffness. It does not establish breaking strength.'},
      {label:'Plastic deformation leaves a permanent change', note:2, patterns:[/(plastic|yield)[\s\S]{0,90}(permanent|won.t return|not return|does not return|cannot return)/, /permanent[\s\S]{0,60}(deform|change|strain|length)/], correction:'After yielding, unloading recovers the elastic component but leaves permanent plastic strain.'}
    ],
    misconceptions:[
      {pattern:/(steeper|stiffer)[\s\S]{0,25}(means|is always|proves|must be)[\s\S]{0,25}(stronger|higher strength)/,text:'A steeper elastic slope does not prove higher strength.',criterion:1},
      {pattern:/(past|beyond|after)[\s\S]{0,20}yield[\s\S]{0,55}(completely returns|fully returns|returns completely|always returns)/,text:'Past yield, the specimen retains permanent deformation.',criterion:2}
    ],
    sample:'Stress is how much force a material experiences. A steeper curve means the material must be stronger. After you stretch it past yield, it always returns to its original length.',
    transfer:{question:'Two rods have identical dimensions. A has twice the Young’s modulus of B. Under the same small tensile force, within both linear elastic regions, how does A’s extension compare?',options:['A extends twice as much','A extends half as much','Both extend equally','There is not enough information'],answer:1,explanation:'In the linear elastic region, ΔL = FL/(AE). With the same force and dimensions, doubling E halves extension.'}
  },
  {
    id:'probability',subject:'PROBABILITY',title:'Independent events',short:'Does a coin remember its last flip?',duration:'5 min',color:'lilac',symbol:'◒',
    intro:'A coin lands heads five times in a row. Your friend says tails is now due. Help them untangle what independence actually means.',
    notes:[
      {title:'Independence',text:'Events A and B are independent when knowing that A occurred does not change the probability of B. For a fair coin with independent flips, each next flip has probability 1/2 of heads, regardless of previous outcomes.'},
      {title:'Joint probability',text:'For independent events, P(A and B) = P(A) × P(B). Two specified heads in two independent fair flips have probability 1/4. A particular long sequence can be unlikely even though its next flip remains 50–50.'},
      {title:'The gambler’s fallacy',text:'A streak does not make the opposite outcome due on an independent trial. Mutually exclusive events cannot occur together; independent events do not influence each other’s probability. These are different ideas.'}
    ],
    questions:[
      'A fair coin lands heads five times. Assuming independent flips, what is the probability of heads next, and why?',
      'What is the probability of heads on BOTH of the next two independent fair flips? Explain how you calculated it.',
      'A friend says independent events cannot happen together. Is that right? What concept are they confusing with independence?'
    ],
    criteria:[
      {label:'Past flips do not change the next probability',note:0,patterns:[/(1\/2|50\s?%|0\.5|half)[\s\S]{0,110}(independent|past|previous|change|memory)/,/(independent|past|previous|change|memory)[\s\S]{0,110}(1\/2|50\s?%|0\.5|half)/],correction:'The next heads probability stays 1/2; previous independent flips do not affect it.'},
      {label:'Multiply probabilities for independent joint events',note:1,patterns:[/(1\/4|25\s?%|0\.25|quarter)[\s\S]{0,70}(multipl|times|×|\*)/,/(multipl|times|×|\*)[\s\S]{0,70}(1\/4|25\s?%|0\.25|quarter)/],correction:'For two independent heads, multiply 1/2 × 1/2 = 1/4.'},
      {label:'Independence differs from mutual exclusivity',note:2,patterns:[/mutually exclusive/,/can[\s\S]{0,20}(happen|occur)[\s\S]{0,15}together/],correction:'Mutually exclusive events cannot occur together. Independent events leave each other’s probabilities unchanged.'}
    ],
    misconceptions:[{pattern:/(tails|opposite)[\s\S]{0,20}(is due|more likely|has to)/,text:'An independent coin flip does not compensate for a streak.',criterion:0}],
    sample:'Independent means events cannot happen together. Since there have been five heads, tails is due and more likely next.',
    transfer:{question:'A fair six-sided die is rolled independently four times and shows 6 every time. What is the probability of a 6 on the next roll?',options:['1 in 2','1 in 6','1 in 30','Less than 1 in 6'],answer:1,explanation:'It remains 1/6. The previous rolls do not change the probability on an independent roll.'}
  },
  {
    id:'economics',subject:'ECONOMICS',title:'Opportunity cost',short:'What does a “free” choice really cost?',duration:'5 min',color:'sage',symbol:'⇄',
    intro:'You have one free evening, a concert ticket, and an exam tomorrow. The price on the ticket is only part of the decision.',
    notes:[
      {title:'The next-best alternative',text:'Opportunity cost is the value of the next-best alternative forgone when making a choice. It is not the sum of every alternative you could imagine.'},
      {title:'More than money',text:'Opportunity cost can include time, learning, leisure, or earnings. A free event can have an opportunity cost if attending means giving up a valuable alternative.'},
      {title:'Sunk costs',text:'A sunk cost has already been incurred and cannot be recovered. For a forward-looking choice, compare future benefits and costs of the available options rather than letting an unrecoverable past payment decide for you.'}
    ],
    questions:[
      'You can either study, work a shift, or watch a movie tonight. If you study and the shift was your next-best option, what is your opportunity cost?',
      'A concert ticket is free. Does attending necessarily have zero opportunity cost? Explain with an alternative use of your time.',
      'You paid for a non-refundable ticket last month, but now prefer to study. Should that unrecoverable payment determine tonight’s choice? Why?'
    ],
    criteria:[
      {label:'Identify the next-best alternative',note:0,patterns:[/next.best/,/(forgo|forgone|giving up|give up|lost|sacrific)[\s\S]{0,55}(shift|work|earn|wage)/,/(shift|work|earn|wage)[\s\S]{0,55}(forgo|forgone|giving up|give up|lost|sacrific)/],correction:'The opportunity cost is the value of your next-best alternative: in this case, the work shift.'},
      {label:'Recognize non-monetary costs',note:1,patterns:[/(free|concert)[\s\S]{0,90}(time|study|studying|leisure)/,/(time|study|studying|leisure)[\s\S]{0,90}(free|concert)/],correction:'A free concert can cost you study time or another valuable use of the evening.'},
      {label:'Separate sunk costs from future choices',note:2,patterns:[/sunk[\s\S]{0,80}(ignore|not|shouldn.t|future|recover|irrelevant)/,/(ignore|not|shouldn.t|future|recover|irrelevant)[\s\S]{0,80}sunk/],correction:'The unrecoverable payment is sunk. Compare future outcomes of studying and attending.'}
    ],
    misconceptions:[{pattern:/(free|zero.price)[\s\S]{0,35}(means|has|so)[\s\S]{0,20}(no|zero) opportunity cost/,text:'A zero price does not imply zero opportunity cost.',criterion:1}],
    sample:'Opportunity cost is the sum of everything you could have done instead. A free concert has no opportunity cost, and you should attend a paid event just because you already bought the ticket.',
    transfer:{question:'You can spend an hour tutoring for $150, working a shift for $100, or relaxing, which you value at $80. If you choose tutoring, what is the opportunity cost?',options:['$0, because you earn money','$80, the value of relaxing','$100, the next-best alternative','$180, both alternatives combined'],answer:2,explanation:'The next-best alternative is the $100 shift. Opportunity cost uses that alternative, not the sum of all alternatives.'}
  }
];
