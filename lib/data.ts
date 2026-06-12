import type { Match, KOMatch, SpecialDef } from '@/types'

export const VM_START = new Date('2026-06-11T19:00:00Z') // Mexico vs Sør-Afrika, 21:00 norsk tid

export const ALL_TEAMS = [
  'Algeria','Argentina','Australia','Belgia','Bosnia-Hercegovina','Brasil',
  'Canada','Colombia','Curaçao','DR Kongo','Ecuador','Egypt','Elfenbenskysten',
  'England','Frankrike','Ghana','Haiti','Indonesia','Iran','Irak','Japan','Jordan',
  'Kapp Verde','Kroatia','Marokko','Mexico','Nederland','New Zealand','Norge',
  'Østerrike','Panama','Paraguay','Portugal','Qatar','Saudi-Arabia','Senegal',
  'Skottland','Spania','Sveits','Sverige','Sør-Afrika','Sør-Korea','Tunisia',
  'Tsjekkia','Tyrkia','Tyskland','Uruguay','USA','Uzbekistan',
].sort()

export const GROUPS: Record<string, string[]> = {
  A: ['Mexico','Sør-Korea','Sør-Afrika','Tsjekkia'],
  B: ['Canada','Qatar','Sveits','Bosnia-Hercegovina'],
  C: ['Brasil','Marokko','Haiti','Skottland'],
  D: ['USA','Tyrkia','Australia','Paraguay'],
  E: ['Tyskland','Elfenbenskysten','Ecuador','Curaçao'],
  F: ['Nederland','Sverige','Japan','Tunisia'],
  G: ['Belgia','Egypt','Iran','New Zealand'],
  H: ['Spania','Uruguay','Saudi-Arabia','Kapp Verde'],
  I: ['Frankrike','Norge','Senegal','Irak'],
  J: ['Argentina','Algeria','Østerrike','Jordan'],
  K: ['Portugal','DR Kongo','England','Kroatia'],
  L: ['Colombia','Uzbekistan','Ghana','Panama'],
}

// Alle tider er UTC. Norsk sommertid = UTC+2
// ET (Eastern) = UTC-4, så ET 15:00 = UTC 19:00 = norsk 21:00
export const GROUP_MATCHES: Match[] = [
  // Torsdag 11. juni
  {id:'A1',home:'Mexico',away:'Sør-Afrika',group:'A',date:'2026-06-11T19:00:00Z'},        // 21:00 NO
  {id:'A2',home:'Sør-Korea',away:'Tsjekkia',group:'A',date:'2026-06-12T02:00:00Z'},       // 04:00 NO

  // Fredag 12. juni
  {id:'B1',home:'Canada',away:'Bosnia-Hercegovina',group:'B',date:'2026-06-12T19:00:00Z'}, // 21:00 NO
  {id:'D1',home:'USA',away:'Paraguay',group:'D',date:'2026-06-13T01:00:00Z'},              // 03:00 NO

  // Lørdag 13. juni
  {id:'B2',home:'Qatar',away:'Sveits',group:'B',date:'2026-06-13T19:00:00Z'},              // 21:00 NO
  {id:'C1',home:'Brasil',away:'Marokko',group:'C',date:'2026-06-13T22:00:00Z'},            // 00:00 NO (14. juni)
  {id:'C2',home:'Haiti',away:'Skottland',group:'C',date:'2026-06-14T01:00:00Z'},           // 03:00 NO

  // Søndag 14. juni
  {id:'D2',home:'Australia',away:'Tyrkia',group:'D',date:'2026-06-14T04:00:00Z'},          // 06:00 NO
  {id:'E1',home:'Tyskland',away:'Curaçao',group:'E',date:'2026-06-14T17:00:00Z'},          // 19:00 NO
  {id:'F1',home:'Nederland',away:'Japan',group:'F',date:'2026-06-14T20:00:00Z'},           // 22:00 NO
  {id:'E2',home:'Elfenbenskysten',away:'Ecuador',group:'E',date:'2026-06-14T23:00:00Z'},   // 01:00 NO (15. juni)

  // Mandag 15. juni
  {id:'F2',home:'Sverige',away:'Tunisia',group:'F',date:'2026-06-15T02:00:00Z'},           // 04:00 NO
  {id:'H1',home:'Spania',away:'Kapp Verde',group:'H',date:'2026-06-15T16:00:00Z'},         // 18:00 NO
  {id:'G1',home:'Belgia',away:'Egypt',group:'G',date:'2026-06-15T19:00:00Z'},              // 21:00 NO
  {id:'H2',home:'Saudi-Arabia',away:'Uruguay',group:'H',date:'2026-06-15T22:00:00Z'},      // 00:00 NO (16. juni)
  {id:'G2',home:'Iran',away:'New Zealand',group:'G',date:'2026-06-16T01:00:00Z'},          // 03:00 NO

  // Tirsdag 16. juni
  {id:'I1',home:'Frankrike',away:'Senegal',group:'I',date:'2026-06-16T19:00:00Z'},         // 21:00 NO
  {id:'I2',home:'Irak',away:'Norge',group:'I',date:'2026-06-16T22:00:00Z'},                // 00:00 NO (17. juni)
  {id:'J1',home:'Argentina',away:'Algeria',group:'J',date:'2026-06-17T01:00:00Z'},         // 03:00 NO

  // Onsdag 17. juni
  {id:'J2',home:'Østerrike',away:'Jordan',group:'J',date:'2026-06-17T04:00:00Z'},          // 06:00 NO
  {id:'K2',home:'England',away:'Kroatia',group:'K',date:'2026-06-17T19:00:00Z'},           // 21:00 NO
  {id:'L1',home:'Colombia',away:'Panama',group:'L',date:'2026-06-17T20:00:00Z'},           // 22:00 NO
  {id:'K1',home:'Portugal',away:'DR Kongo',group:'K',date:'2026-06-17T22:00:00Z'},         // 00:00 NO (18. juni)
  {id:'L2',home:'Uzbekistan',away:'Ghana',group:'L',date:'2026-06-18T01:00:00Z'},          // 03:00 NO

  // Torsdag 18. juni – 2. runde
  {id:'A3',home:'Mexico',away:'Sør-Korea',group:'A',date:'2026-06-18T17:00:00Z'},          // 19:00 NO
  {id:'A4',home:'Tsjekkia',away:'Sør-Afrika',group:'A',date:'2026-06-18T20:00:00Z'},       // 22:00 NO
  {id:'B3',home:'Canada',away:'Qatar',group:'B',date:'2026-06-18T23:00:00Z'},              // 01:00 NO (19. juni)
  {id:'B4',home:'Sveits',away:'Bosnia-Hercegovina',group:'B',date:'2026-06-19T02:00:00Z'}, // 04:00 NO

  // Fredag 19. juni
  {id:'C3',home:'Brasil',away:'Haiti',group:'C',date:'2026-06-19T17:00:00Z'},              // 19:00 NO
  {id:'D3',home:'USA',away:'Australia',group:'D',date:'2026-06-19T20:00:00Z'},             // 22:00 NO
  {id:'C4',home:'Skottland',away:'Marokko',group:'C',date:'2026-06-19T23:00:00Z'},         // 01:00 NO (20. juni)
  {id:'E4',home:'Ecuador',away:'Curaçao',group:'E',date:'2026-06-20T02:00:00Z'},           // 04:00 NO

  // Lørdag 20. juni
  {id:'E3',home:'Tyskland',away:'Elfenbenskysten',group:'E',date:'2026-06-20T17:00:00Z'},  // 19:00 NO
  {id:'G4',home:'New Zealand',away:'Egypt',group:'G',date:'2026-06-20T20:00:00Z'},         // 22:00 NO
  {id:'F3',home:'Nederland',away:'Sverige',group:'F',date:'2026-06-20T23:00:00Z'},         // 01:00 NO (21. juni)
  {id:'D4',home:'Tyrkia',away:'Paraguay',group:'D',date:'2026-06-21T02:00:00Z'},           // 04:00 NO

  // Søndag 21. juni
  {id:'H3',home:'Spania',away:'Saudi-Arabia',group:'H',date:'2026-06-21T16:00:00Z'},       // 18:00 NO
  {id:'G3',home:'Belgia',away:'Iran',group:'G',date:'2026-06-21T19:00:00Z'},               // 21:00 NO
  {id:'H4',home:'Uruguay',away:'Kapp Verde',group:'H',date:'2026-06-21T22:00:00Z'},        // 00:00 NO (22. juni)
  {id:'I3',home:'Frankrike',away:'Irak',group:'I',date:'2026-06-22T01:00:00Z'},            // 03:00 NO

  // Mandag 22. juni
  {id:'I4',home:'Norge',away:'Senegal',group:'I',date:'2026-06-22T17:00:00Z'},             // 19:00 NO
  {id:'F4',home:'Tunisia',away:'Japan',group:'F',date:'2026-06-22T20:00:00Z'},             // 22:00 NO
  {id:'J3',home:'Argentina',away:'Østerrike',group:'J',date:'2026-06-22T23:00:00Z'},       // 01:00 NO (23. juni)
  {id:'J4',home:'Jordan',away:'Algeria',group:'J',date:'2026-06-23T02:00:00Z'},            // 04:00 NO

  // Tirsdag 23. juni
  {id:'K3',home:'Portugal',away:'England',group:'K',date:'2026-06-23T17:00:00Z'},          // 19:00 NO
  {id:'L3',home:'Colombia',away:'Uzbekistan',group:'L',date:'2026-06-23T20:00:00Z'},       // 22:00 NO
  {id:'K4',home:'Kroatia',away:'DR Kongo',group:'K',date:'2026-06-23T23:00:00Z'},          // 01:00 NO (24. juni)
  {id:'L4',home:'Ghana',away:'Panama',group:'L',date:'2026-06-24T02:00:00Z'},              // 04:00 NO

  // Onsdag 24. juni – 3. runde (samtidige kamper)
  {id:'B5',home:'Canada',away:'Sveits',group:'B',date:'2026-06-24T19:00:00Z'},             // 21:00 NO
  {id:'B6',home:'Bosnia-Hercegovina',away:'Qatar',group:'B',date:'2026-06-24T19:00:00Z'},  // 21:00 NO

  // Torsdag 25. juni
  {id:'A5',home:'Mexico',away:'Tsjekkia',group:'A',date:'2026-06-25T19:00:00Z'},           // 21:00 NO
  {id:'A6',home:'Sør-Afrika',away:'Sør-Korea',group:'A',date:'2026-06-25T19:00:00Z'},      // 21:00 NO
  {id:'C5',home:'Brasil',away:'Skottland',group:'C',date:'2026-06-25T22:00:00Z'},          // 00:00 NO (26. juni)
  {id:'C6',home:'Marokko',away:'Haiti',group:'C',date:'2026-06-25T22:00:00Z'},             // 00:00 NO (26. juni)

  // Fredag 26. juni
  {id:'D5',home:'USA',away:'Tyrkia',group:'D',date:'2026-06-26T19:00:00Z'},                // 21:00 NO
  {id:'D6',home:'Paraguay',away:'Australia',group:'D',date:'2026-06-26T19:00:00Z'},        // 21:00 NO
  {id:'E5',home:'Tyskland',away:'Ecuador',group:'E',date:'2026-06-26T22:00:00Z'},          // 00:00 NO (27. juni)
  {id:'E6',home:'Curaçao',away:'Elfenbenskysten',group:'E',date:'2026-06-26T22:00:00Z'},   // 00:00 NO (27. juni)

  // Lørdag 27. juni
  {id:'F5',home:'Nederland',away:'Tunisia',group:'F',date:'2026-06-27T19:00:00Z'},         // 21:00 NO
  {id:'F6',home:'Sverige',away:'Japan',group:'F',date:'2026-06-27T19:00:00Z'},             // 21:00 NO
  {id:'G5',home:'Belgia',away:'New Zealand',group:'G',date:'2026-06-27T22:00:00Z'},        // 00:00 NO (28. juni)
  {id:'G6',home:'Egypt',away:'Iran',group:'G',date:'2026-06-27T22:00:00Z'},                // 00:00 NO (28. juni)

  // Søndag 28. juni
  {id:'H5',home:'Spania',away:'Uruguay',group:'H',date:'2026-06-28T19:00:00Z'},            // 21:00 NO
  {id:'H6',home:'Kapp Verde',away:'Saudi-Arabia',group:'H',date:'2026-06-28T19:00:00Z'},   // 21:00 NO
  {id:'I5',home:'Frankrike',away:'Norge',group:'I',date:'2026-06-28T22:00:00Z'},           // 00:00 NO (29. juni)
  {id:'I6',home:'Senegal',away:'Irak',group:'I',date:'2026-06-28T22:00:00Z'},              // 00:00 NO (29. juni)

  // Mandag 29. juni
  {id:'J5',home:'Argentina',away:'Jordan',group:'J',date:'2026-06-29T19:00:00Z'},          // 21:00 NO
  {id:'J6',home:'Algeria',away:'Østerrike',group:'J',date:'2026-06-29T19:00:00Z'},         // 21:00 NO
  {id:'K5',home:'Portugal',away:'Kroatia',group:'K',date:'2026-06-29T22:00:00Z'},          // 00:00 NO (30. juni)
  {id:'K6',home:'DR Kongo',away:'England',group:'K',date:'2026-06-29T22:00:00Z'},          // 00:00 NO (30. juni)

  // Tirsdag 30. juni
  {id:'L5',home:'Colombia',away:'Ghana',group:'L',date:'2026-06-30T19:00:00Z'},            // 21:00 NO
  {id:'L6',home:'Panama',away:'Uzbekistan',group:'L',date:'2026-06-30T19:00:00Z'},         // 21:00 NO
]

export const KO_MATCHES: KOMatch[] = [
  // Runde av 32 – 28. juni – 4. juli
  {id:'R32_1',round:'Runde av 32',label:'Runde av 32 – Kamp 1',home:null,away:null,date:'2026-06-30T22:00:00Z'},
  {id:'R32_2',round:'Runde av 32',label:'Runde av 32 – Kamp 2',home:null,away:null,date:'2026-07-01T01:00:00Z'},
  {id:'R32_3',round:'Runde av 32',label:'Runde av 32 – Kamp 3',home:null,away:null,date:'2026-07-01T19:00:00Z'},
  {id:'R32_4',round:'Runde av 32',label:'Runde av 32 – Kamp 4',home:null,away:null,date:'2026-07-01T22:00:00Z'},
  {id:'R32_5',round:'Runde av 32',label:'Runde av 32 – Kamp 5',home:null,away:null,date:'2026-07-02T01:00:00Z'},
  {id:'R32_6',round:'Runde av 32',label:'Runde av 32 – Kamp 6',home:null,away:null,date:'2026-07-02T19:00:00Z'},
  {id:'R32_7',round:'Runde av 32',label:'Runde av 32 – Kamp 7',home:null,away:null,date:'2026-07-02T22:00:00Z'},
  {id:'R32_8',round:'Runde av 32',label:'Runde av 32 – Kamp 8',home:null,away:null,date:'2026-07-03T01:00:00Z'},
  {id:'R32_9',round:'Runde av 32',label:'Runde av 32 – Kamp 9',home:null,away:null,date:'2026-07-03T19:00:00Z'},
  {id:'R32_10',round:'Runde av 32',label:'Runde av 32 – Kamp 10',home:null,away:null,date:'2026-07-03T22:00:00Z'},
  {id:'R32_11',round:'Runde av 32',label:'Runde av 32 – Kamp 11',home:null,away:null,date:'2026-07-04T01:00:00Z'},
  {id:'R32_12',round:'Runde av 32',label:'Runde av 32 – Kamp 12',home:null,away:null,date:'2026-07-04T19:00:00Z'},
  {id:'R32_13',round:'Runde av 32',label:'Runde av 32 – Kamp 13',home:null,away:null,date:'2026-07-04T22:00:00Z'},
  {id:'R32_14',round:'Runde av 32',label:'Runde av 32 – Kamp 14',home:null,away:null,date:'2026-07-05T01:00:00Z'},
  {id:'R32_15',round:'Runde av 32',label:'Runde av 32 – Kamp 15',home:null,away:null,date:'2026-07-05T19:00:00Z'},
  {id:'R32_16',round:'Runde av 32',label:'Runde av 32 – Kamp 16',home:null,away:null,date:'2026-07-05T22:00:00Z'},
  // Runde av 16 – 7.–9. juli
  {id:'R16_1',round:'Runde av 16',label:'Runde av 16 – Kamp 1',home:null,away:null,date:'2026-07-07T19:00:00Z'},
  {id:'R16_2',round:'Runde av 16',label:'Runde av 16 – Kamp 2',home:null,away:null,date:'2026-07-07T22:00:00Z'},
  {id:'R16_3',round:'Runde av 16',label:'Runde av 16 – Kamp 3',home:null,away:null,date:'2026-07-08T19:00:00Z'},
  {id:'R16_4',round:'Runde av 16',label:'Runde av 16 – Kamp 4',home:null,away:null,date:'2026-07-08T22:00:00Z'},
  {id:'R16_5',round:'Runde av 16',label:'Runde av 16 – Kamp 5',home:null,away:null,date:'2026-07-09T19:00:00Z'},
  {id:'R16_6',round:'Runde av 16',label:'Runde av 16 – Kamp 6',home:null,away:null,date:'2026-07-09T22:00:00Z'},
  {id:'R16_7',round:'Runde av 16',label:'Runde av 16 – Kamp 7',home:null,away:null,date:'2026-07-10T19:00:00Z'},
  {id:'R16_8',round:'Runde av 16',label:'Runde av 16 – Kamp 8',home:null,away:null,date:'2026-07-10T22:00:00Z'},
  // Kvartfinaler – 11.–12. juli
  {id:'QF1',round:'Kvartfinale',label:'Kvartfinale 1',home:null,away:null,date:'2026-07-11T19:00:00Z'},
  {id:'QF2',round:'Kvartfinale',label:'Kvartfinale 2',home:null,away:null,date:'2026-07-11T22:00:00Z'},
  {id:'QF3',round:'Kvartfinale',label:'Kvartfinale 3',home:null,away:null,date:'2026-07-12T19:00:00Z'},
  {id:'QF4',round:'Kvartfinale',label:'Kvartfinale 4',home:null,away:null,date:'2026-07-12T22:00:00Z'},
  // Semifinaler – 14.–15. juli
  {id:'SF1',round:'Semifinale',label:'Semifinale 1',home:null,away:null,date:'2026-07-14T22:00:00Z'},
  {id:'SF2',round:'Semifinale',label:'Semifinale 2',home:null,away:null,date:'2026-07-15T22:00:00Z'},
  // Bronsefinale – 18. juli
  {id:'3RD',round:'Bronsefinale',label:'Bronsefinale',home:null,away:null,date:'2026-07-18T22:00:00Z'},
  // Finale – 19. juli
  {id:'FINAL',round:'FINALE',label:'VM-FINALEN 🏆',home:null,away:null,date:'2026-07-19T19:00:00Z'},
]

const TOPSCORER_OPTIONS = [
  'Kylian Mbappé (Frankrike)','Erling Haaland (Norge)','Harry Kane (England)',
  'Vinicius Jr. (Brasil)','Lamine Yamal (Spania)','Cristiano Ronaldo (Portugal)',
  'Lionel Messi (Argentina)','Jude Bellingham (England)','Pedri (Spania)',
  'Mohamed Salah (Egypt)','Raphinha (Brasil)','Phil Foden (England)',
  'Antoine Griezmann (Frankrike)','Martin Ødegaard (Norge)','Bukayo Saka (England)',
  'Michael Olise (Frankrike)',
]

const KEEPER_OPTIONS = [
  'Thibaut Courtois (Belgia)','Alisson (Brasil)','Manuel Neuer (Tyskland)',
  'Marc-André ter Stegen (Tyskland)','Ederson (Brasil)','Mike Maignan (Frankrike)',
  'Jordan Pickford (England)','Gianluigi Donnarumma','André Onana',
  'Gregor Kobel (Sveits)','Yann Sommer (Sveits)','David Raya (Spania)',
  'Unai Simón (Spania)','Ørjan Nyland (Norge)','Matt Turner (USA)',
]

export const SPECIALS: SpecialDef[] = [
  {id:'sp_topscorer',label:'⚽ Toppscorer (Gullstøvelen)',desc:'Hvem scorer flest mål i VM 2026?',type:'select',options:TOPSCORER_OPTIONS,lockAtStart:true,points:15},
  {id:'sp_winner',label:'🏆 VM-vinner',desc:'Hvilket lag vinner FIFA VM 2026?',type:'select',options:ALL_TEAMS,lockAtStart:true,points:20},
  {id:'sp_finalist',label:'🥈 VM-finalist (taper)',desc:'Hvilket lag taper finalen?',type:'select',options:ALL_TEAMS,lockAtStart:true,points:12},
  {id:'sp_golden_glove',label:'🧤 Golden Glove (Beste keeper)',desc:'Hvem vinner prisen for beste keeper i VM?',type:'select',options:KEEPER_OPTIONS,lockAtStart:true,points:10},
  {id:'sp_norge_exit',label:'🇳🇴 Norges beste runde',desc:'Hvor langt kommer Norge i VM?',type:'radio',options:['Gruppespill','Runde av 32','Runde av 16','Kvartfinale','Semifinale','Finale','🏆 Vinner'],lockAtStart:true,points:10},
  {id:'sp_no_goal',label:'🧱 Flest nullere (best forsvar)',desc:'Hvilket lag holder flest kamper uten baklengsmål?',type:'select',options:ALL_TEAMS,lockAtStart:true,points:10},
  {id:'sp_hattrick_final',label:'🎩 Hattrick i finalen?',desc:'Scorer noen hattrick i VM-finalen?',type:'radio',options:['Ja','Nei'],lockAtStart:false,points:8},
  {id:'sp_ronaldo_red',label:'🟥 Får Ronaldo rødt kort?',desc:'Får Cristiano Ronaldo rødt kort i VM?',type:'radio',options:['Ja','Nei'],lockAtStart:false,points:8},
  {id:'sp_haaland_hattrick',label:'🎩 Haaland hattrick i VM?',desc:'Scorer Erling Haaland hattrick i minst én kamp?',type:'radio',options:['Ja','Nei'],lockAtStart:false,points:8},
  {id:'sp_mbappe_top2',label:'📊 Mbappé blant topp 2 toppscorere?',desc:'Ender Kylian Mbappé blant de to øverste på toppscorerlisten?',type:'radio',options:['Ja','Nei'],lockAtStart:true,points:6},
  {id:'sp_penalties',label:'🎯 Antall straffesparksavgjørelser',desc:'Hvor mange sluttspillkamper avgjøres på straffepark?',type:'select',options:['0','1','2','3','4','5','6','7','8','9','10+'],lockAtStart:false,points:8},
  {id:'sp_red_cards',label:'🟥 Totalt røde kort i VM',desc:'Gjett totalt antall røde kort gjennom hele turneringen',type:'select',options:['Under 5','5–8','9–12','13–16','17–20','21–25','Over 25'],lockAtStart:false,points:6},
  {id:'sp_most_goals',label:'💥 Høyest scoring i én kamp',desc:'Hva er totalt antall mål i kampen med flest mål?',type:'select',options:['4','5','6','7','8','9','10','11','12 eller mer'],lockAtStart:false,points:10},
]
