export default {
    "success" : true,

    "project" : {
        "calendar"  : "general",
        "startDate" : "2019-01-14"
    },

    "calendars" : {
        "rows" : [
            {
                "id"        : "general",
                "name"      : "General",
                "intervals" : [
                    {
                        "recurrentStartDate" : "on Sat at 0:00",
                        "recurrentEndDate"   : "on Mon at 0:00",
                        "isWorking"          : false
                    }
                ],
                "expanded" : true,
                "children" : [
                    {
                        "id"           : "business",
                        "name"         : "Business",
                        "hoursPerDay"  : 8,
                        "daysPerWeek"  : 5,
                        "daysPerMonth" : 20,
                        "intervals"    : [
                            {
                                "recurrentStartDate" : "every weekday at 12:00",
                                "recurrentEndDate"   : "every weekday at 13:00",
                                "isWorking"          : false
                            },
                            {
                                "recurrentStartDate" : "every weekday at 17:00",
                                "recurrentEndDate"   : "every weekday at 08:00",
                                "isWorking"          : false
                            }
                        ]
                    },
                    {
                        "id"           : "night",
                        "name"         : "Night shift",
                        "hoursPerDay"  : 8,
                        "daysPerWeek"  : 5,
                        "daysPerMonth" : 20,
                        "intervals"    : [
                            {
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
                "id": 1000,
                "name": "Launch SaaS Product",
                "percentDone": 50,
                "startDate": "2019-01-14",
                "expanded": true,
                "children": [
                    {
                        "id": 1,
                        "name": "Setup web server",
                        "percentDone": 50,
                        "duration": 10,
                        "startDate": "2019-01-14",
                        "expanded": true,
                        "children": [
                            {
                                "id": 11,
                                "name": "Install Apache",
                                "percentDone": 50,
                                "startDate": "2019-01-14",
                                "rollup": true,
                                "duration": 3,
                                "color": "teal",
                                "endDate": "2019-01-17",
                                "cost": 200,
                                "baselines": [
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-16T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-16T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-16T23:00:00"
                                    }
                                ]
                            },
                            {
                                "id": 12,
                                "name": "Configure firewall",
                                "percentDone": 50,
                                "startDate": "2019-01-14",
                                "duration": 3,
                                "endDate": "2019-01-17",
                                "showInTimeline": true,
                                "cost": 1000,
                                "baselines": [
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-16T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-16T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-16T23:00:00"
                                    }
                                ]
                            },
                            {
                                "id": 13,
                                "name": "Setup load balancer",
                                "percentDone": 50,
                                "startDate": "2019-01-14",
                                "rollup": true,
                                "duration": 3,
                                "endDate": "2019-01-17",
                                "cost": 1200,
                                "baselines": [
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-16T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-16T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-16T23:00:00"
                                    }
                                ]
                            },
                            {
                                "id": 14,
                                "name": "Configure ports",
                                "percentDone": 50,
                                "startDate": "2019-01-14",
                                "duration": 2,
                                "endDate": "2019-01-16",
                                "cost": 750,
                                "baselines": [
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-15T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-15T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-15T23:00:00"
                                    }
                                ]
                            },
                            {
                                "id": 15,
                                "name": "Run tests",
                                "percentDone": 0,
                                "startDate": "2019-01-21",
                                "duration": 2,
                                "endDate": "2019-01-23",
                                "cost": 5000,
                                "baselines": [
                                    {
                                        "startDate": "2019-01-20T23:00:00",
                                        "endDate": "2019-01-22T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-20T23:00:00",
                                        "endDate": "2019-01-22T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-20T23:00:00",
                                        "endDate": "2019-01-22T23:00:00"
                                    }
                                ]
                            }
                        ],
                        "endDate": "2019-01-23",
                        "baselines": [
                            {
                                "startDate": "2019-01-13T23:00:00",
                                "endDate": "2019-01-22T23:00:00"
                            },
                            {
                                "startDate": "2019-01-13T23:00:00",
                                "endDate": "2019-01-22T23:00:00"
                            },
                            {
                                "startDate": "2019-01-13T23:00:00",
                                "endDate": "2019-01-22T23:00:00"
                            }
                        ]
                    },
                    {
                        "id": 2,
                        "name": "Website Design",
                        "percentDone": 60,
                        "startDate": "2019-01-23",
                        "expanded": true,
                        "children": [
                            {
                                "id": 21,
                                "name": "Contact designers",
                                "percentDone": 70,
                                "startDate": "2019-01-23",
                                "duration": 5,
                                "endDate": "2019-01-30",
                                "cost": 500,
                                "baselines": [
                                    {
                                        "startDate": "2019-01-22T23:00:00",
                                        "endDate": "2019-01-25T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-22T23:00:00",
                                        "endDate": "2019-01-28T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-22T23:00:00",
                                        "endDate": "2019-01-29T23:00:00"
                                    }
                                ]
                            },
                            {
                                "id": 22,
                                "name": "Create shortlist of three designers",
                                "percentDone": 60,
                                "startDate": "2019-01-30",
                                "duration": 1,
                                "endDate": "2019-01-31",
                                "cost": 1000,
                                "baselines": [
                                    {
                                        "startDate": "2019-01-27T23:00:00",
                                        "endDate": "2019-01-28T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-28T23:00:00",
                                        "endDate": "2019-01-29T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-29T23:00:00",
                                        "endDate": "2019-01-30T23:00:00"
                                    }
                                ]
                            },
                            {
                                "id": 23,
                                "name": "Select & review final design",
                                "percentDone": 50,
                                "startDate": "2019-01-31",
                                "duration": 2,
                                "showInTimeline": true,
                                "endDate": "2019-02-02",
                                "cost": 1000,
                                "baselines": [
                                    {
                                        "startDate": "2019-01-28T23:00:00",
                                        "endDate": "2019-01-30T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-29T23:00:00",
                                        "endDate": "2019-01-31T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-30T23:00:00",
                                        "endDate": "2019-02-01T23:00:00"
                                    }
                                ]
                            },
                            {
                                "id": 24,
                                "name": "Inform management about decision",
                                "percentDone": 100,
                                "startDate": "2019-02-04",
                                "duration": 0,
                                "cost": 500,
                                "baselines": [
                                    {
                                        "startDate": "2019-01-30T23:00:00",
                                        "endDate": "2019-01-30T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-31T23:00:00",
                                        "endDate": "2019-01-31T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-02-01T23:00:00",
                                        "endDate": "2019-02-01T23:00:00"
                                    }
                                ]
                            },
                            {
                                "id": 25,
                                "name": "Apply design to web site",
                                "percentDone": 0,
                                "startDate": "2019-02-04",
                                "duration": 7,
                                "endDate": "2019-02-13",
                                "cost": 11000,
                                "baselines": [
                                    {
                                        "startDate": "2019-01-30T23:00:00",
                                        "endDate": "2019-02-08T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-31T23:00:00",
                                        "endDate": "2019-02-11T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-02-03T23:00:00",
                                        "endDate": "2019-02-12T23:00:00"
                                    }
                                ]
                            }
                        ],
                        "endDate": "2019-02-13",
                        "baselines": [
                            {
                                "startDate": "2019-01-22T23:00:00",
                                "endDate": "2019-02-08T23:00:00"
                            },
                            {
                                "startDate": "2019-01-22T23:00:00",
                                "endDate": "2019-02-11T23:00:00"
                            },
                            {
                                "startDate": "2019-01-22T23:00:00",
                                "endDate": "2019-02-12T23:00:00"
                            }
                        ]
                    },
                    {
                        "id": 3,
                        "name": "Setup Test Strategy",
                        "percentDone": 20,
                        "startDate": "2019-01-14",
                        "expanded": true,
                        "children": [
                            {
                                "id": 31,
                                "name": "Hire QA staff",
                                "percentDone": 40,
                                "startDate": "2019-01-14",
                                "duration": 5,
                                "endDate": "2019-01-19",
                                "cost": 6000,
                                "baselines": [
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-18T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-18T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-13T23:00:00",
                                        "endDate": "2019-01-18T23:00:00"
                                    }
                                ]
                            },
                            {
                                "id": 33,
                                "name": "Write test specs",
                                "percentDone": 9,
                                "duration": 5,
                                "startDate": "2019-01-21",
                                "expanded": true,
                                "children": [
                                    {
                                        "id": 331,
                                        "name": "Unit tests",
                                        "percentDone": 20,
                                        "startDate": "2019-01-21",
                                        "duration": 10,
                                        "endDate": "2019-02-02",
                                        "showInTimeline": true,
                                        "cost": 7000,
                                        "baselines": [
                                            {
                                                "startDate": "2019-01-20T23:00:00",
                                                "endDate": "2019-02-01T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-01-20T23:00:00",
                                                "endDate": "2019-02-01T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-01-20T23:00:00",
                                                "endDate": "2019-02-01T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 332,
                                        "name": "UI unit tests / individual screens",
                                        "percentDone": 10,
                                        "startDate": "2019-01-21",
                                        "duration": 5,
                                        "endDate": "2019-01-26",
                                        "showInTimeline": true,
                                        "cost": 5000,
                                        "baselines": [
                                            {
                                                "startDate": "2019-01-20T23:00:00",
                                                "endDate": "2019-01-25T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-01-20T23:00:00",
                                                "endDate": "2019-01-25T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-01-20T23:00:00",
                                                "endDate": "2019-01-25T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 333,
                                        "name": "Application tests",
                                        "percentDone": 0,
                                        "startDate": "2019-01-21",
                                        "duration": 10,
                                        "endDate": "2019-02-02",
                                        "cost": 2500,
                                        "baselines": [
                                            {
                                                "startDate": "2019-01-20T23:00:00",
                                                "endDate": "2019-02-01T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-01-20T23:00:00",
                                                "endDate": "2019-02-01T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-01-20T23:00:00",
                                                "endDate": "2019-02-01T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 334,
                                        "name": "Monkey tests",
                                        "percentDone": 0,
                                        "startDate": "2019-01-21",
                                        "duration": 1,
                                        "endDate": "2019-01-22",
                                        "cost": 250,
                                        "baselines": [
                                            {
                                                "startDate": "2019-01-20T23:00:00",
                                                "endDate": "2019-01-21T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-01-20T23:00:00",
                                                "endDate": "2019-01-21T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-01-20T23:00:00",
                                                "endDate": "2019-01-21T23:00:00"
                                            }
                                        ]
                                    }
                                ],
                                "endDate": "2019-02-02",
                                "baselines": [
                                    {
                                        "startDate": "2019-01-20T23:00:00",
                                        "endDate": "2019-02-01T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-20T23:00:00",
                                        "endDate": "2019-02-01T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-01-20T23:00:00",
                                        "endDate": "2019-02-01T23:00:00"
                                    }
                                ]
                            }
                        ],
                        "endDate": "2019-02-02",
                        "baselines": [
                            {
                                "startDate": "2019-01-13T23:00:00",
                                "endDate": "2019-02-01T23:00:00"
                            },
                            {
                                "startDate": "2019-01-13T23:00:00",
                                "endDate": "2019-02-01T23:00:00"
                            },
                            {
                                "startDate": "2019-01-13T23:00:00",
                                "endDate": "2019-02-01T23:00:00"
                            }
                        ]
                    },
                    {
                        "id": 4,
                        "name": "Application Implementation",
                        "percentDone": 60,
                        "startDate": "2019-02-04",
                        "expanded": true,
                        "children": [
                            {
                                "id": 400,
                                "name": "Phase #1",
                                "expanded": true,
                                "children": [
                                    {
                                        "id": 41,
                                        "name": "Authentication module",
                                        "percentDone": 100,
                                        "duration": 5,
                                        "startDate": "2019-02-04",
                                        "endDate": "2019-02-09",
                                        "cost": 8000,
                                        "baselines": [
                                            {
                                                "startDate": "2019-02-03T23:00:00",
                                                "endDate": "2019-02-08T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-03T23:00:00",
                                                "endDate": "2019-02-08T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-03T23:00:00",
                                                "endDate": "2019-02-08T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 42,
                                        "name": "Single sign on",
                                        "percentDone": 100,
                                        "duration": 3,
                                        "startDate": "2019-02-04",
                                        "endDate": "2019-02-07",
                                        "cost": 4700,
                                        "baselines": [
                                            {
                                                "startDate": "2019-02-03T23:00:00",
                                                "endDate": "2019-02-06T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-03T23:00:00",
                                                "endDate": "2019-02-06T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-03T23:00:00",
                                                "endDate": "2019-02-06T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 43,
                                        "name": "Implement role based access",
                                        "percentDone": 0,
                                        "duration": 4,
                                        "startDate": "2019-02-04",
                                        "endDate": "2019-02-08",
                                        "cost": 5800,
                                        "baselines": [
                                            {
                                                "startDate": "2019-02-03T23:00:00",
                                                "endDate": "2019-02-07T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-03T23:00:00",
                                                "endDate": "2019-02-07T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-03T23:00:00",
                                                "endDate": "2019-02-07T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 44,
                                        "name": "Basic test coverage",
                                        "showInTimeline": true,
                                        "percentDone": 0,
                                        "duration": 3,
                                        "startDate": "2019-02-04",
                                        "endDate": "2019-02-07",
                                        "cost": 7000,
                                        "baselines": [
                                            {
                                                "startDate": "2019-02-03T23:00:00",
                                                "endDate": "2019-02-06T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-03T23:00:00",
                                                "endDate": "2019-02-06T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-03T23:00:00",
                                                "endDate": "2019-02-06T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 45,
                                        "name": "Verify high test coverage",
                                        "percentDone": 0,
                                        "duration": 2,
                                        "startDate": "2019-02-11",
                                        "endDate": "2019-02-13",
                                        "cost": 16000,
                                        "baselines": [
                                            {
                                                "startDate": "2019-02-11",
                                                "endDate": "2019-02-13"
                                            },
                                            {
                                                "startDate": "2019-02-11",
                                                "endDate": "2019-02-13"
                                            },
                                            {
                                                "startDate": "2019-02-11",
                                                "endDate": "2019-02-13"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 46,
                                        "name": "Make backup",
                                        "percentDone": 0,
                                        "duration": 0,
                                        "startDate": "2019-02-13",
                                        "endDate": "2019-02-13",
                                        "showInTimeline": true,
                                        "rollup": true,
                                        "cost": 500,
                                        "baselines": [
                                            {
                                                "startDate": "2019-02-11",
                                                "endDate": "2019-02-11"
                                            },
                                            {
                                                "startDate": "2019-02-12",
                                                "endDate": "2019-02-12"
                                            },
                                            {
                                                "startDate": "2019-02-13",
                                                "endDate": "2019-02-13"
                                            }
                                        ]
                                    }
                                ],
                                "startDate": "2019-02-04",
                                "endDate": "2019-02-09",
                                "baselines": [
                                    {
                                        "startDate": "2019-02-03T23:00:00",
                                        "endDate": "2019-02-08T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-02-03T23:00:00",
                                        "endDate": "2019-02-08T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-02-03T23:00:00",
                                        "endDate": "2019-02-08T23:00:00"
                                    }
                                ]
                            },
                            {
                                "id": 401,
                                "name": "Phase #2",
                                "expanded": true,
                                "children": [
                                    {
                                        "id": 4011,
                                        "name": "Authentication module",
                                        "percentDone": 70,
                                        "duration": 15,
                                        "startDate": "2019-02-11",
                                        "endDate": "2019-03-02",
                                        "cost": 1200,
                                        "baselines": [
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-03-01T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-03-01T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-03-01T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 4012,
                                        "name": "Single sign on",
                                        "percentDone": 60,
                                        "duration": 5,
                                        "startDate": "2019-02-11",
                                        "endDate": "2019-02-16",
                                        "cost": 2500,
                                        "baselines": [
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-02-15T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-02-15T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-02-15T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 4013,
                                        "name": "Implement role based access",
                                        "percentDone": 50,
                                        "duration": 21,
                                        "startDate": "2019-02-11",
                                        "endDate": "2019-03-12",
                                        "cost": 4100,
                                        "baselines": [
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-03-11T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-03-11T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-03-11T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 4014,
                                        "name": "Basic test coverage",
                                        "percentDone": 0,
                                        "duration": 20,
                                        "startDate": "2019-02-11",
                                        "endDate": "2019-03-09",
                                        "cost": 1100,
                                        "baselines": [
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-03-08T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-03-08T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-03-08T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 4015,
                                        "name": "Verify high test coverage",
                                        "percentDone": 0,
                                        "duration": 4,
                                        "startDate": "2019-02-11",
                                        "endDate": "2019-02-15",
                                        "cost": 3000,
                                        "baselines": [
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-02-14T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-02-14T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-02-10T23:00:00",
                                                "endDate": "2019-02-14T23:00:00"
                                            }
                                        ]
                                    }
                                ],
                                "startDate": "2019-02-11",
                                "endDate": "2019-03-12",
                                "baselines": [
                                    {
                                        "startDate": "2019-02-10T23:00:00",
                                        "endDate": "2019-03-11T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-02-10T23:00:00",
                                        "endDate": "2019-03-11T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-02-10T23:00:00",
                                        "endDate": "2019-03-11T23:00:00"
                                    }
                                ]
                            },
                            {
                                "id": 402,
                                "name": "Acceptance phase",
                                "expanded": true,
                                "children": [
                                    {
                                        "id": 4031,
                                        "name": "Company bug bash",
                                        "percentDone": 70,
                                        "duration": 3,
                                        "startDate": "2019-03-12",
                                        "endDate": "2019-03-15",
                                        "cost": 10000,
                                        "baselines": [
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-14T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-14T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-14T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 4032,
                                        "name": "Test all web pages",
                                        "percentDone": 60,
                                        "duration": 2,
                                        "startDate": "2019-03-12",
                                        "endDate": "2019-03-14",
                                        "cost": 5000,
                                        "baselines": [
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-13T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-13T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-13T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 4033,
                                        "name": "Verify no broken links",
                                        "percentDone": 50,
                                        "duration": 4,
                                        "startDate": "2019-03-12",
                                        "endDate": "2019-03-16",
                                        "cost": 1000,
                                        "baselines": [
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-15T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-15T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-15T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 4034,
                                        "name": "Make test release",
                                        "percentDone": 0,
                                        "duration": 3,
                                        "startDate": "2019-03-12",
                                        "endDate": "2019-03-15",
                                        "cost": 1200,
                                        "baselines": [
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-14T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-14T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-14T23:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 4035,
                                        "name": "Send invitation email",
                                        "percentDone": 0,
                                        "duration": 0,
                                        "startDate": "2019-03-15",
                                        "endDate": "2019-03-16",
                                        "cost": 250,
                                        "baselines": [
                                            {
                                                "startDate": "2019-03-14T23:00:00",
                                                "endDate": "2019-03-14T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-03-13T00:00:00",
                                                "endDate": "2019-03-13T00:00:00"
                                            },
                                            {
                                                "startDate": "2019-03-12T00:00:00",
                                                "endDate": "2019-03-12T00:00:00"
                                            }
                                        ]
                                    },
                                    {
                                        "id": 4036,
                                        "name": "Celebrate launch",
                                        "iconCls": "b-fa b-fa-glass-cheers",
                                        "percentDone": 0,
                                        "duration": 1,
                                        "startDate": "2019-03-12",
                                        "endDate": "2019-03-13",
                                        "cost": 2500,
                                        "baselines": [
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-12T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-12T23:00:00"
                                            },
                                            {
                                                "startDate": "2019-03-11T23:00:00",
                                                "endDate": "2019-03-12T23:00:00"
                                            }
                                        ]
                                    }
                                ],
                                "startDate": "2019-03-12",
                                "endDate": "2019-03-16",
                                "baselines": [
                                    {
                                        "startDate": "2019-03-11T23:00:00",
                                        "endDate": "2019-03-15T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-03-11T23:00:00",
                                        "endDate": "2019-03-15T23:00:00"
                                    },
                                    {
                                        "startDate": "2019-03-11T23:00:00",
                                        "endDate": "2019-03-15T23:00:00"
                                    }
                                ]
                            }
                        ],
                        "endDate": "2019-03-16",
                        "baselines": [
                            {
                                "startDate": "2019-02-03T23:00:00",
                                "endDate": "2019-03-15T23:00:00"
                            },
                            {
                                "startDate": "2019-02-03T23:00:00",
                                "endDate": "2019-03-15T23:00:00"
                            },
                            {
                                "startDate": "2019-02-03T23:00:00",
                                "endDate": "2019-03-15T23:00:00"
                            }
                        ]
                    }
                ],
                "endDate": "2019-03-16",
                "baselines": [
                    {
                        "startDate": "2019-01-13T23:00:00",
                        "endDate": "2019-03-15T23:00:00"
                    },
                    {
                        "startDate": "2019-01-13T23:00:00",
                        "endDate": "2019-03-15T23:00:00"
                    },
                    {
                        "startDate": "2019-01-13T23:00:00",
                        "endDate": "2019-03-15T23:00:00"
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
                "id"       : 3,
                "fromTask" : 13,
                "toTask"   : 15
            },
            {
                "id"       : 4,
                "fromTask" : 14,
                "toTask"   : 15
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
                "id"       : 10,
                "fromTask" : 24,
                "toTask"   : 25
            },
            {
                "id"       : 11,
                "fromTask" : 31,
                "toTask"   : 33
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
                "id"       : 14,
                "fromTask" : 402,
                "toTask"   : 403
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
            }
        ]
    },

    "resources" : {
        "rows" : [
            { "id" : 1, "name" : "Celia", "city" : "Barcelona", "calendar" : "general", "image" : "celia.jpg" },
            { "id" : 2, "name" : "Lee", "city" : "London", "calendar" : "general", "image" : "lee.jpg"  },
            { "id" : 3, "name" : "Macy", "city" : "New York","calendar" : "general", "image" : "macy.jpg"  },
            { "id" : 4, "name" : "Madison", "city" : "Barcelona", "calendar" : "general","image" : "madison.jpg"  },
            { "id" : 5, "name" : "Rob", "city" : "Rome", "calendar" : "business", "image" : "rob.jpg"  },
            { "id" : 6, "name" : "Dave", "city" : "Barcelona", "calendar" : "night", "image" : "dave.jpg"  },
            { "id" : 7, "name" : "Dan", "city" : "London", "calendar" : "night", "image" : "dan.jpg"  },
            { "id" : 8, "name" : "George", "city" : "New York", "calendar" : "general", "image" : "george.jpg"  },
            { "id" : 9, "name" : "Gloria", "city" : "Rome", "calendar" : "general", "image" : "gloria.jpg"  },
            { "id" : 10, "name" : "Henrik", "city" : "London", "calendar" : "general", "image" : "henrik.jpg"  }
        ]
    },

    "assignments" : {
        "rows" : [
            { "id" : 1, "event" : 11,  "resource" : 1 },
            { "id" : 2, "event" : 12,  "resource" : 1 },
            { "id" : 3, "event" : 12,  "resource" : 9 },
            { "id" : 4, "event" : 13,  "resource" : 2 },
            { "id" : 5, "event" : 13,  "resource" : 3 },
            { "id" : 6, "event" : 13,  "resource" : 6 },
            { "id" : 7, "event" : 13,  "resource" : 7 },
            { "id" : 8, "event" : 13,  "resource" : 8 },
            { "id" : 9, "event" : 21,  "resource" : 5 },
            { "id" : 10, "event" : 21,  "resource" : 9 },
            { "id" : 11, "event" : 22,  "resource" : 8 },
            { "id" : 12, "event" : 25,  "resource" : 3 }
        ]
    },

    "timeRanges"    : {
        "rows": [
            {
                "id"       : 1,
                "name"     : "Important date",
                "startDate": "2019-01-30",
                "duration" : 0,
                "durationUnit" : "d",
                "cls"      : "b-fa b-fa-diamond"
            }
        ]
    }
}
