export default {
    "success" : true,
    "project" : {
    "name"         : "Launch SaaS",
        "calendar"     : "general",
        "startDate"    : "2025-01-14",
        "endDate"      : "2025-03-20",
        "description"  : "My awesome project",
        "hoursPerDay"  : 24,
        "daysPerWeek"  : 5,
        "daysPerMonth" : 20
},
    "calendars" : {
    "rows" : [
        {
            "id"        : "general",
            "name"      : "General",
            "intervals" : [
                {
                    "id"                 : 1,
                    "recurrentStartDate" : "on Sat",
                    "recurrentEndDate"   : "on Mon",
                    "isWorking"          : false
                }
            ],
            "children" : [
                {
                    "id"        : "business",
                    "name"      : "Business",
                    "intervals" : [
                        {
                            "id"                 : 2,
                            "recurrentStartDate" : "every weekday at 12:00",
                            "recurrentEndDate"   : "every weekday at 13:00",
                            "isWorking"          : false
                        },
                        {
                            "id"                 : 3,
                            "recurrentStartDate" : "every weekday at 17:00",
                            "recurrentEndDate"   : "every weekday at 08:00",
                            "isWorking"          : false
                        }
                    ]
                },
                {
                    "id"        : "night",
                    "name"      : "Night shift",
                    "intervals" : [
                        {
                            "id"                 : 4,
                            "recurrentStartDate" : "every weekday at 6:00",
                            "recurrentEndDate"   : "every weekday at 22:00",
                            "isWorking"          : false
                        }
                    ]
                }
            ]
        }
    ]
},
    "tasks" : {
    "rows" : [
        {
            "id"          : 1000,
            "name"        : "Launch SaaS Product",
            "percentDone" : 35.7,
            "startDate"   : "2025-01-14",
            "endDate"     : "2025-03-20",
            "duration"    : 47,
            "cost"        : 10230,
            "expanded"    : true,
            "complexity"  : 3,
            "children"    : [
                {
                    "id"          : 1,
                    "name"        : "Setup web server",
                    "percentDone" : 42.9,
                    "duration"    : 7,
                    "startDate"   : "2025-01-14",
                    "rollup"      : true,
                    "endDate"     : "2025-01-23",
                    "cost"        : 6385,
                    "expanded"    : true,
                    "complexity"  : 2,
                    "children"    : [
                        {
                            "id"          : 11,
                            "name"        : "Install Apache",
                            "percentDone" : 50,
                            "startDate"   : "2025-01-14",
                            "rollup"      : true,
                            "duration"    : 3,
                            "endDate"     : "2025-01-17",
                            "cost"        : 6385,
                            "priority"    : 1,
                            "complexity"  : 1,
                            "baselines"   : [
                                {
                                    "startDate" : "2025-01-15T00:00:00",
                                    "endDate"   : "2025-01-17T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-13T00:00:00",
                                    "endDate"   : "2025-01-16T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-13T00:00:00",
                                    "endDate"   : "2025-01-16T00:00:00"
                                }
                            ]
                        },
                        {
                            "id"             : 12,
                            "name"           : "Configure firewall",
                            "percentDone"    : 50,
                            "startDate"      : "2025-01-14",
                            "rollup"         : true,
                            "complexity"     : 0,
                            "duration"       : 3,
                            "endDate"        : "2025-01-17",
                            "showInTimeline" : true,
                            "priority"       : 1,
                            "baselines"      : [
                                {
                                    "startDate" : "2025-01-16T00:00:00",
                                    "endDate"   : "2025-01-20T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-14T00:00:00",
                                    "endDate"   : "2025-01-18T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-13T00:00:00",
                                    "endDate"   : "2025-01-16T00:00:00"
                                }
                            ]
                        },
                        {
                            "id"          : 13,
                            "name"        : "Setup load balancer",
                            "percentDone" : 0,
                            "rollup"      : true,
                            "complexity"  : 0,
                            "priority"    : 2,
                            "duration"    : null,
                            "baselines"   : [
                                {
                                    "startDate" : "2025-01-13T00:00:00",
                                    "endDate"   : "2025-01-16T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-15",
                                    "endDate"   : "2025-01-18"
                                },
                                {
                                    "startDate" : "2025-01-13T00:00:00",
                                    "endDate"   : "2025-01-16T00:00:00"
                                }
                            ]
                        },
                        {
                            "id"           : 14,
                            "name"         : "Configure ports",
                            "percentDone"  : 50,
                            "startDate"    : "2025-01-14",
                            "rollup"       : true,
                            "complexity"   : 0,
                            "duration"     : 6,
                            "durationUnit" : "eday",
                            "endDate"      : "2025-01-20",
                            "priority"     : 3,
                            "baselines"    : [
                                {
                                    "startDate" : "2025-01-17T00:00:00",
                                    "endDate"   : "2025-01-19T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-13T00:00:00",
                                    "endDate"   : "2025-01-15T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-15T00:00:00",
                                    "endDate"   : "2025-01-18T00:00:00"
                                }
                            ]
                        },
                        {
                            "id"          : 15,
                            "name"        : "Run tests",
                            "percentDone" : 0,
                            "startDate"   : "2025-01-21",
                            "endDate"     : "2025-01-23",
                            "complexity"  : 0,
                            "rollup"      : true,
                            "duration"    : 2,
                            "priority"    : 2,
                            "baselines"   : [
                                {
                                    "startDate" : "2025-01-20T00:00:00",
                                    "endDate"   : "2025-01-22T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-20T00:00:00",
                                    "endDate"   : "2025-01-22T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-20T00:00:00",
                                    "endDate"   : "2025-01-22T00:00:00"
                                }
                            ]
                        }
                    ],
                    "baselines" : [
                        {
                            "startDate" : "2025-01-13T00:00:00",
                            "endDate"   : "2025-01-22T00:00:00"
                        },
                        {
                            "startDate" : "2025-01-13T00:00:00",
                            "endDate"   : "2025-01-22T00:00:00"
                        },
                        {
                            "startDate" : "2025-01-13T00:00:00",
                            "endDate"   : "2025-01-22T00:00:00"
                        }
                    ]
                },
                {
                    "id"          : 2,
                    "name"        : "Website Design",
                    "complexity"  : 2,
                    "percentDone" : 63.8,
                    "startDate"   : "2025-01-23",
                    "rollup"      : true,
                    "endDate"     : "2025-02-04",
                    "duration"    : 8,
                    "expanded"    : true,
                    "children"    : [
                        {
                            "id"          : 21,
                            "name"        : "Contact designers",
                            "percentDone" : 70,
                            "startDate"   : "2025-01-23",
                            "rollup"      : true,
                            "complexity"  : 1,
                            "duration"    : 5,
                            "endDate"     : "2025-01-30",
                            "priority"    : 3,
                            "baselines"   : [
                                {
                                    "startDate" : "2025-01-22T00:00:00",
                                    "endDate"   : "2025-01-25T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-22T00:00:00",
                                    "endDate"   : "2025-01-28T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-22T00:00:00",
                                    "endDate"   : "2025-01-29T00:00:00"
                                }
                            ]
                        },
                        {
                            "id"          : 22,
                            "name"        : "Create shortlist of three designers",
                            "percentDone" : 60,
                            "complexity"  : 1,
                            "startDate"   : "2025-01-30",
                            "rollup"      : true,
                            "duration"    : 1,
                            "endDate"     : "2025-01-31",
                            "priority"    : 2,
                            "baselines"   : [
                                {
                                    "startDate" : "2025-01-27T00:00:00",
                                    "endDate"   : "2025-01-28T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-28T00:00:00",
                                    "endDate"   : "2025-01-29T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-29T00:00:00",
                                    "endDate"   : "2025-01-30T00:00:00"
                                }
                            ]
                        },
                        {
                            "id"             : 23,
                            "name"           : "Select & review final design",
                            "percentDone"    : 50,
                            "startDate"      : "2025-01-31",
                            "complexity"     : 1,
                            "rollup"         : true,
                            "duration"       : 2,
                            "showInTimeline" : true,
                            "endDate"        : "2025-02-04",
                            "priority"       : 1,
                            "baselines"      : [
                                {
                                    "startDate" : "2025-01-28T00:00:00",
                                    "endDate"   : "2025-01-30T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-29T00:00:00",
                                    "endDate"   : "2025-01-31T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-30T00:00:00",
                                    "endDate"   : "2025-02-01T00:00:00"
                                }
                            ]
                        },
                        {
                            "id"          : 24,
                            "name"        : "Inform management about decision",
                            "percentDone" : 100,
                            "complexity"  : 2,
                            "startDate"   : "2025-02-04",
                            "endDate"     : "2025-02-04",
                            "rollup"      : true,
                            "duration"    : 0,
                            "priority"    : 2,
                            "baselines"   : [
                                {
                                    "startDate" : "2025-01-30T00:00:00",
                                    "endDate"   : "2025-01-30T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-31T00:00:00",
                                    "endDate"   : "2025-01-31T00:00:00"
                                },
                                {
                                    "startDate" : "2025-02-01T00:00:00",
                                    "endDate"   : "2025-02-01T00:00:00"
                                }
                            ]
                        },
                        {
                            "id"          : 25,
                            "name"        : "Apply design to web site",
                            "percentDone" : 0,
                            "complexity"  : 3,
                            "rollup"      : true,
                            "priority"    : 1,
                            "duration"    : null,
                            "baselines"   : [
                                {
                                    "startDate" : "2025-01-30T00:00:00",
                                    "endDate"   : "2025-02-08T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-31T00:00:00",
                                    "endDate"   : "2025-02-11T00:00:00"
                                },
                                {
                                    "startDate" : "2025-02-03T00:00:00",
                                    "endDate"   : "2025-02-12T00:00:00"
                                }
                            ]
                        }
                    ],
                    "baselines" : [
                        {
                            "startDate" : "2025-01-22T00:00:00",
                            "endDate"   : "2025-02-08T00:00:00"
                        },
                        {
                            "startDate" : "2025-01-22T00:00:00",
                            "endDate"   : "2025-02-11T00:00:00"
                        },
                        {
                            "startDate" : "2025-01-22T00:00:00",
                            "endDate"   : "2025-02-12T00:00:00"
                        }
                    ]
                },
                {
                    "id"          : 3,
                    "name"        : "Setup Test Strategy",
                    "percentDone" : 14.5,
                    "complexity"  : 1,
                    "startDate"   : "2025-01-14",
                    "expanded"    : true,
                    "children"    : [
                        {
                            "id"          : 31,
                            "name"        : "Hire QA staff",
                            "percentDone" : 40,
                            "complexity"  : 2,
                            "startDate"   : "2025-01-14",
                            "duration"    : 5,
                            "endDate"     : "2025-01-21",
                            "priority"    : 2,
                            "baselines"   : [
                                {
                                    "startDate" : "2025-01-13T00:00:00",
                                    "endDate"   : "2025-01-18T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-13T00:00:00",
                                    "endDate"   : "2025-01-18T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-13T00:00:00",
                                    "endDate"   : "2025-01-18T00:00:00"
                                }
                            ]
                        },
                        {
                            "id"          : 33,
                            "name"        : "Write test specs",
                            "percentDone" : 9.6,
                            "duration"    : 10,
                            "complexity"  : 2,
                            "startDate"   : "2025-01-21",
                            "expanded"    : true,
                            "priority"    : 3,
                            "children"    : [
                                {
                                    "id"             : 331,
                                    "name"           : "Unit tests",
                                    "complexity"     : 2,
                                    "percentDone"    : 20,
                                    "startDate"      : "2025-01-21",
                                    "duration"       : 10,
                                    "endDate"        : "2025-02-04",
                                    "showInTimeline" : true,
                                    "priority"       : 1,
                                    "baselines"      : [
                                        {
                                            "startDate" : "2025-01-20T00:00:00",
                                            "endDate"   : "2025-02-01T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-01-20T00:00:00",
                                            "endDate"   : "2025-02-01T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-01-20T00:00:00",
                                            "endDate"   : "2025-02-01T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"             : 332,
                                    "name"           : "UI unit tests / individual screens",
                                    "percentDone"    : 10,
                                    "startDate"      : "2025-01-21",
                                    "complexity"     : 2,
                                    "duration"       : 5,
                                    "endDate"        : "2025-01-28",
                                    "showInTimeline" : true,
                                    "priority"       : 2,
                                    "baselines"      : [
                                        {
                                            "startDate" : "2025-01-20T00:00:00",
                                            "endDate"   : "2025-01-25T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-01-20T00:00:00",
                                            "endDate"   : "2025-01-25T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-01-20T00:00:00",
                                            "endDate"   : "2025-01-25T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 333,
                                    "name"        : "Application tests",
                                    "percentDone" : 0,
                                    "startDate"   : "2025-01-21",
                                    "complexity"  : 2,
                                    "duration"    : 10,
                                    "endDate"     : "2025-02-04",
                                    "priority"    : 3,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-01-20T00:00:00",
                                            "endDate"   : "2025-02-01T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-01-20T00:00:00",
                                            "endDate"   : "2025-02-01T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-01-20T00:00:00",
                                            "endDate"   : "2025-02-01T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 334,
                                    "name"        : "Monkey tests",
                                    "percentDone" : 0,
                                    "startDate"   : "2025-01-21",
                                    "duration"    : 1,
                                    "complexity"  : 1,
                                    "endDate"     : "2025-01-22",
                                    "priority"    : 3,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-01-20T00:00:00",
                                            "endDate"   : "2025-01-21T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-01-20T00:00:00",
                                            "endDate"   : "2025-01-21T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-01-20T00:00:00",
                                            "endDate"   : "2025-01-21T00:00:00"
                                        }
                                    ]
                                }
                            ],
                            "endDate"   : "2025-02-04",
                            "baselines" : [
                                {
                                    "startDate" : "2025-01-20T00:00:00",
                                    "endDate"   : "2025-02-01T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-20T00:00:00",
                                    "endDate"   : "2025-02-01T00:00:00"
                                },
                                {
                                    "startDate" : "2025-01-20T00:00:00",
                                    "endDate"   : "2025-02-01T00:00:00"
                                }
                            ]
                        }
                    ],
                    "endDate"   : "2025-02-04",
                    "duration"  : 15,
                    "baselines" : [
                        {
                            "startDate" : "2025-01-13T00:00:00",
                            "endDate"   : "2025-02-01T00:00:00"
                        },
                        {
                            "startDate" : "2025-01-13T00:00:00",
                            "endDate"   : "2025-02-01T00:00:00"
                        },
                        {
                            "startDate" : "2025-01-13T00:00:00",
                            "endDate"   : "2025-02-01T00:00:00"
                        }
                    ]
                },
                {
                    "id"          : 4,
                    "name"        : "Application Implementation",
                    "percentDone" : 39.3,
                    "startDate"   : "2025-02-04",
                    "duration"    : 32,
                    "cost"        : 3845,
                    "complexity"  : 2,
                    "expanded"    : true,
                    "children"    : [
                        {
                            "id"       : 400,
                            "name"     : "Phase #1",
                            "expanded" : true,
                            "duration" : 7,
                            "children" : [
                                {
                                    "id"          : 41,
                                    "name"        : "Authentication module",
                                    "percentDone" : 100,
                                    "duration"    : 5,
                                    "startDate"   : "2025-02-04",
                                    "endDate"     : "2025-02-11",
                                    "priority"    : 1,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-02-03T00:00:00",
                                            "endDate"   : "2025-02-08T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-03T00:00:00",
                                            "endDate"   : "2025-02-08T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-03T00:00:00",
                                            "endDate"   : "2025-02-08T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 42,
                                    "name"        : "Single sign on",
                                    "complexity"  : 2,
                                    "percentDone" : 100,
                                    "duration"    : 3,
                                    "startDate"   : "2025-02-04",
                                    "endDate"     : "2025-02-07",
                                    "priority"    : 3,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-02-03T00:00:00",
                                            "endDate"   : "2025-02-06T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-03T00:00:00",
                                            "endDate"   : "2025-02-06T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-03T00:00:00",
                                            "endDate"   : "2025-02-06T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 43,
                                    "name"        : "Implement role based access",
                                    "percentDone" : 0,
                                    "duration"    : 4,
                                    "complexity"  : 2,
                                    "startDate"   : "2025-02-04",
                                    "endDate"     : "2025-02-08",
                                    "priority"    : 3,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-02-03T00:00:00",
                                            "endDate"   : "2025-02-07T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-03T00:00:00",
                                            "endDate"   : "2025-02-07T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-03T00:00:00",
                                            "endDate"   : "2025-02-07T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"             : 44,
                                    "name"           : "Basic test coverage",
                                    "showInTimeline" : true,
                                    "cls"            : "important",
                                    "percentDone"    : 0,
                                    "duration"       : 3,
                                    "startDate"      : "2025-02-04",
                                    "endDate"        : "2025-02-07",
                                    "complexity"     : 0,
                                    "priority"       : 2,
                                    "baselines"      : [
                                        {
                                            "startDate" : "2025-02-03T00:00:00",
                                            "endDate"   : "2025-02-06T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-03T00:00:00",
                                            "endDate"   : "2025-02-06T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-03T00:00:00",
                                            "endDate"   : "2025-02-06T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 45,
                                    "name"        : "Verify high test coverage",
                                    "percentDone" : 0,
                                    "duration"    : 2,
                                    "complexity"  : 0,
                                    "startDate"   : "2025-02-11",
                                    "endDate"     : "2025-02-13",
                                    "priority"    : 3,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-02-11",
                                            "endDate"   : "2025-02-13"
                                        },
                                        {
                                            "startDate" : "2025-02-11",
                                            "endDate"   : "2025-02-13"
                                        },
                                        {
                                            "startDate" : "2025-02-11",
                                            "endDate"   : "2025-02-13"
                                        }
                                    ]
                                },
                                {
                                    "id"             : 46,
                                    "name"           : "Make backup",
                                    "percentDone"    : 0,
                                    "duration"       : 0,
                                    "complexity"     : 0,
                                    "startDate"      : "2025-02-13",
                                    "endDate"        : "2025-02-13",
                                    "showInTimeline" : true,
                                    "rollup"         : true,
                                    "priority"       : 1,
                                    "baselines"      : [
                                        {
                                            "startDate" : "2025-02-11",
                                            "endDate"   : "2025-02-11"
                                        },
                                        {
                                            "startDate" : "2025-02-12",
                                            "endDate"   : "2025-02-12"
                                        },
                                        {
                                            "startDate" : "2025-02-13",
                                            "endDate"   : "2025-02-13"
                                        }
                                    ]
                                }
                            ],
                            "percentDone" : 47.1,
                            "startDate"   : "2025-02-04",
                            "endDate"     : "2025-02-13",
                            "baselines"   : [
                                {
                                    "startDate" : "2025-02-03T00:00:00",
                                    "endDate"   : "2025-02-08T00:00:00"
                                },
                                {
                                    "startDate" : "2025-02-03T00:00:00",
                                    "endDate"   : "2025-02-08T00:00:00"
                                },
                                {
                                    "startDate" : "2025-02-03T00:00:00",
                                    "endDate"   : "2025-02-08T00:00:00"
                                }
                            ]
                        },
                        {
                            "id"         : 401,
                            "name"       : "Phase #2",
                            "expanded"   : true,
                            "duration"   : 21,
                            "complexity" : 0,
                            "children"   : [
                                {
                                    "id"          : 4011,
                                    "name"        : "Authentication module",
                                    "percentDone" : 70,
                                    "duration"    : 15,
                                    "complexity"  : 0,
                                    "startDate"   : "2025-02-13",
                                    "endDate"     : "2025-03-06",
                                    "priority"    : 3,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-03-01T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-03-01T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-03-01T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 4012,
                                    "name"        : "Single sign on",
                                    "percentDone" : 60,
                                    "complexity"  : 1,
                                    "duration"    : 5,
                                    "startDate"   : "2025-02-13",
                                    "endDate"     : "2025-02-20",
                                    "priority"    : 3,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-02-15T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-02-15T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-02-15T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 4013,
                                    "name"        : "Implement role based access",
                                    "percentDone" : 50,
                                    "complexity"  : 1,
                                    "duration"    : 21,
                                    "startDate"   : "2025-02-13",
                                    "endDate"     : "2025-03-14",
                                    "priority"    : 3,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-03-11T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-03-11T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-03-11T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 4014,
                                    "name"        : "Basic test coverage",
                                    "percentDone" : 0,
                                    "complexity"  : 0,
                                    "duration"    : 20,
                                    "startDate"   : "2025-02-13",
                                    "endDate"     : "2025-03-13",
                                    "priority"    : 2,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-03-08T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-03-08T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-03-08T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 4015,
                                    "name"        : "Verify high test coverage",
                                    "percentDone" : 0,
                                    "duration"    : 4,
                                    "complexity"  : 0,
                                    "startDate"   : "2025-02-13",
                                    "endDate"     : "2025-02-19",
                                    "priority"    : 3,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-02-14T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-02-14T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-02-10T00:00:00",
                                            "endDate"   : "2025-02-14T00:00:00"
                                        }
                                    ]
                                }
                            ],
                            "startDate"   : "2025-02-13",
                            "endDate"     : "2025-03-14",
                            "percentDone" : 36.9,
                            "baselines"   : [
                                {
                                    "startDate" : "2025-02-10T00:00:00",
                                    "endDate"   : "2025-03-11T00:00:00"
                                },
                                {
                                    "startDate" : "2025-02-10T00:00:00",
                                    "endDate"   : "2025-03-11T00:00:00"
                                },
                                {
                                    "startDate" : "2025-02-10T00:00:00",
                                    "endDate"   : "2025-03-11T00:00:00"
                                }
                            ]
                        },
                        {
                            "id"         : 402,
                            "name"       : "Acceptance phase",
                            "complexity" : 0,
                            "expanded"   : true,
                            "cost"       : 3845,
                            "children"   : [
                                {
                                    "id"          : 4031,
                                    "name"        : "Company bug bash",
                                    "percentDone" : 70,
                                    "complexity"  : 0,
                                    "duration"    : 3,
                                    "startDate"   : "2025-03-14",
                                    "endDate"     : "2025-03-19",
                                    "priority"    : 2,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-14T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-14T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-14T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 4032,
                                    "name"        : "Test all web pages",
                                    "percentDone" : 60,
                                    "duration"    : 2,
                                    "startDate"   : "2025-03-14",
                                    "complexity"  : 0,
                                    "endDate"     : "2025-03-18",
                                    "priority"    : 2,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-13T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-13T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-13T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 4033,
                                    "name"        : "Verify no broken links",
                                    "percentDone" : 50,
                                    "duration"    : 4,
                                    "cost"        : 3845,
                                    "complexity"  : 0,
                                    "startDate"   : "2025-03-14",
                                    "endDate"     : "2025-03-20",
                                    "priority"    : 3,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-15T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-15T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-15T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 4034,
                                    "name"        : "Make test release",
                                    "percentDone" : 0,
                                    "complexity"  : 1,
                                    "duration"    : 3,
                                    "startDate"   : "2025-03-14",
                                    "endDate"     : "2025-03-19",
                                    "priority"    : 2,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-14T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-14T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-14T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 4035,
                                    "name"        : "Send invitation email",
                                    "complexity"  : 1,
                                    "percentDone" : 0,
                                    "duration"    : 0,
                                    "startDate"   : "2025-03-19",
                                    "endDate"     : "2025-03-19",
                                    "priority"    : 2,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-03-14T00:00:00",
                                            "endDate"   : "2025-03-14T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-03-13T00:00:00",
                                            "endDate"   : "2025-03-13T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-03-12T00:00:00",
                                            "endDate"   : "2025-03-12T00:00:00"
                                        }
                                    ]
                                },
                                {
                                    "id"          : 4036,
                                    "name"        : "Celebrate launch",
                                    "iconCls"     : "fa fa-glass-cheers",
                                    "complexity"  : 1,
                                    "percentDone" : 0,
                                    "duration"    : 1,
                                    "startDate"   : "2025-03-19",
                                    "endDate"     : "2025-03-20",
                                    "priority"    : 1,
                                    "baselines"   : [
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-12T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-12T00:00:00"
                                        },
                                        {
                                            "startDate" : "2025-03-11T00:00:00",
                                            "endDate"   : "2025-03-12T00:00:00"
                                        }
                                    ]
                                }
                            ],
                            "startDate"   : "2025-03-14",
                            "endDate"     : "2025-03-20",
                            "duration"    : 4,
                            "percentDone" : 40.8,
                            "baselines"   : [
                                {
                                    "startDate" : "2025-03-11T00:00:00",
                                    "endDate"   : "2025-03-15T00:00:00"
                                },
                                {
                                    "startDate" : "2025-03-11T00:00:00",
                                    "endDate"   : "2025-03-15T00:00:00"
                                },
                                {
                                    "startDate" : "2025-03-11T00:00:00",
                                    "endDate"   : "2025-03-15T00:00:00"
                                }
                            ]
                        }
                    ],
                    "endDate"   : "2025-03-20",
                    "baselines" : [
                        {
                            "startDate" : "2025-02-03T00:00:00",
                            "endDate"   : "2025-03-15T00:00:00"
                        },
                        {
                            "startDate" : "2025-02-03T00:00:00",
                            "endDate"   : "2025-03-15T00:00:00"
                        },
                        {
                            "startDate" : "2025-02-03T00:00:00",
                            "endDate"   : "2025-03-15T00:00:00"
                        }
                    ]
                }
            ],
            "baselines" : [
                {
                    "startDate" : "2025-01-13T00:00:00",
                    "endDate"   : "2025-03-15T00:00:00"
                },
                {
                    "startDate" : "2025-01-13T00:00:00",
                    "endDate"   : "2025-03-15T00:00:00"
                },
                {
                    "startDate" : "2025-01-13T00:00:00",
                    "endDate"   : "2025-03-15T00:00:00"
                }
            ]
        }
    ]
},
    "dependencies" : {
    "rows" : [
        {
            "id"       : 1,
            "fromTask" : 11,
            "toTask"   : 15,
            "lag"      : 2
        },
        {
            "id"       : 2,
            "fromTask" : 12,
            "toTask"   : 15
        },
        {
            "id"       : 4,
            "fromTask" : 14,
            "toTask"   : 15,
            "cls"      : "special-dependency"
        },
        {
            "id"       : 5,
            "fromTask" : 15,
            "toTask"   : 21
        },
        {
            "id"       : 7,
            "fromTask" : 21,
            "toTask"   : 22
        },
        {
            "id"       : 8,
            "fromTask" : 22,
            "toTask"   : 23
        },
        {
            "id"       : 9,
            "fromTask" : 23,
            "toTask"   : 24
        },
        {
            "id"       : 11,
            "fromTask" : 31,
            "toTask"   : 331
        },
        {
            "id"       : 111,
            "fromTask" : 31,
            "toTask"   : 332
        },
        {
            "id"       : 112,
            "fromTask" : 31,
            "toTask"   : 333
        },
        {
            "id"       : 113,
            "fromTask" : 31,
            "toTask"   : 334
        },
        {
            "id"       : 12,
            "fromTask" : 400,
            "toTask"   : 401
        },
        {
            "id"       : 13,
            "fromTask" : 401,
            "toTask"   : 402
        },
        {
            "id"       : 15,
            "fromTask" : 3,
            "toTask"   : 4
        },
        {
            "id"       : 16,
            "fromTask" : 41,
            "toTask"   : 45
        },
        {
            "id"       : 17,
            "fromTask" : 42,
            "toTask"   : 45
        },
        {
            "id"       : 18,
            "fromTask" : 43,
            "toTask"   : 45
        },
        {
            "id"       : 19,
            "fromTask" : 44,
            "toTask"   : 45
        },
        {
            "id"       : 20,
            "fromTask" : 4034,
            "toTask"   : 4035
        },
        {
            "id"       : 21,
            "fromTask" : 4035,
            "toTask"   : 4036
        },
        {
            "id"       : 22,
            "fromTask" : 45,
            "toTask"   : 46
        }
    ]
},
    "resources" : {
    "rows" : [
        {
            "id"               : 1,
            "name"             : "Celia",
            "city"             : "Barcelona",
            "calendar"         : null,
            "image"            : "celia.png",
            "defaultRateTable" : "default",
            "rateTables"       : [
                {
                    "id"    : "default",
                    "name"  : "Default",
                    "rates" : [
                        {
                            "id"                     : 1,
                            "startDate"              : "2025-01-01",
                            "standardRate"           : 40,
                            "standardRateEffortUnit" : "hour",
                            "perUseCost"             : 5
                        }
                    ]
                },
                {
                    "id"    : "discount-20",
                    "name"  : "20% off",
                    "rates" : [
                        {
                            "id"                     : 2,
                            "startDate"              : "2025-01-01",
                            "standardRate"           : 32,
                            "standardRateEffortUnit" : "hour",
                            "perUseCost"             : 4
                        }
                    ]
                }
            ]
        },
        {
            "id"               : 2,
            "name"             : "MacBook Pro",
            "city"             : "London",
            "calendar"         : null,
            "image"            : false,
            "iconCls"          : "fa fa-laptop",
            "type"             : "material",
            "materialLabel"    : "laptop(s)",
            "defaultRateTable" : "default",
            "rateTables"       : [
                {
                    "id"    : "default",
                    "name"  : "Default",
                    "rates" : [
                        {
                            "id"           : 3,
                            "startDate"    : "2025-01-01",
                            "standardRate" : 600
                        }
                    ]
                }
            ]
        },
        {
            "id"       : 3,
            "name"     : "Server rent",
            "city"     : null,
            "calendar" : null,
            "image"    : false,
            "iconCls"  : "fa fa-server",
            "type"     : "cost"
        },
        {
            "id"       : 4,
            "name"     : "Madison",
            "city"     : "Barcelona",
            "calendar" : null,
            "image"    : "madison.png"
        },
        {
            "id"       : 5,
            "name"     : "Rob",
            "city"     : "Rome",
            "calendar" : "business",
            "image"    : "rob.png"
        },
        {
            "id"       : 6,
            "name"     : "Dave",
            "city"     : "Barcelona",
            "calendar" : "night",
            "image"    : "dave.png"
        },
        {
            "id"       : 7,
            "name"     : "Dan",
            "city"     : "London",
            "calendar" : "night",
            "image"    : "dan.png"
        },
        {
            "id"       : 8,
            "name"     : "George",
            "city"     : "New York",
            "calendar" : null,
            "image"    : "george.png"
        },
        {
            "id"       : 9,
            "name"     : "Gloria",
            "city"     : "Rome",
            "calendar" : null,
            "image"    : "gloria.png"
        },
        {
            "id"       : 10,
            "name"     : "Henrik",
            "city"     : "London",
            "calendar" : null,
            "image"    : "henrik.png"
        }
    ]
},
    "assignments" : {
    "rows" : [
        {
            "id"        : 1,
            "event"     : 11,
            "resource"  : 1,
            "rateTable" : "default"
        },
        {
            "id"       : 2,
            "event"    : 4033,
            "resource" : 1
        },
        {
            "id"       : 3,
            "event"    : 12,
            "resource" : 9
        },
        {
            "id"        : 4,
            "event"     : 11,
            "resource"  : 2,
            "quantity"  : 5,
            "rateTable" : "default"
        },
        {
            "id"       : 5,
            "event"    : 11,
            "resource" : 3,
            "cost"     : 500
        },
        {
            "id"       : 6,
            "event"    : 13,
            "resource" : 6
        },
        {
            "id"       : 7,
            "event"    : 13,
            "resource" : 7
        },
        {
            "id"       : 8,
            "event"    : 13,
            "resource" : 8
        },
        {
            "id"       : 9,
            "event"    : 21,
            "resource" : 5
        },
        {
            "id"       : 10,
            "event"    : 21,
            "resource" : 9
        },
        {
            "id"       : 11,
            "event"    : 22,
            "resource" : 8
        },
        {
            "id"       : 12,
            "event"    : 25,
            "resource" : 3
        }
    ]
},
    "timeRanges" : {
    "rows" : [
        {
            "id"           : 1,
            "name"         : "Important date",
            "startDate"    : "2025-01-30",
            "duration"     : 0,
            "durationUnit" : "d",
            "cls"          : "fa fa-diamond"
        }
    ]
}
}
