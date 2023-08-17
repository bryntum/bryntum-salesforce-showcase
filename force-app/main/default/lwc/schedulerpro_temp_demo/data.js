export const data = {
  success: true,
  project: {
    calendar: "workweek"
  },
  calendars: {
    rows: [
      {
        id: "workweek",
        name: "Work week",
        intervals: [
          {
            recurrentStartDate: "on Sat at 0:00",
            recurrentEndDate: "on Mon at 0:00",
            isWorking: false
          }
        ]
      },
      {
        id: "firstdayhalf",
        name: "First day half",
        unspecifiedTimeIsWorking: false,
        intervals: [
          {
            name: "Available",
            recurrentStartDate: "every weekday at 08:00",
            recurrentEndDate: "every weekday at 12:00",
            isWorking: true
          }
        ]
      },
      {
        id: "seconddayhalf",
        name: "Second day half",
        unspecifiedTimeIsWorking: false,
        intervals: [
          {
            name: "Available",
            recurrentStartDate: "every weekday at 13:00",
            recurrentEndDate: "every weekday at 17:00",
            isWorking: true
          }
        ]
      },
      {
        id: "allday",
        name: "All day",
        unspecifiedTimeIsWorking: false,
        intervals: [
          {
            name: "Available",
            recurrentStartDate: "every weekday at 09:00",
            recurrentEndDate: "every weekday at 19:00",
            isWorking: true
          }
        ]
      }
    ]
  },
  resources: {
    rows: [
      {
        id: 1,
        name: "Jacob Washington",
        role: "Doctor",
        roleIconCls: "b-icon b-fa-user-md",
        calendar: "firstdayhalf",
        image: false
      },
      {
        id: 2,
        name: "David Strauss",
        role: "Radiation oncology nurse",
        roleIconCls: "b-icon b-fa-user-nurse",
        calendar: "seconddayhalf",
        image: "dan"
      },
      {
        id: 3,
        name: "Henrik Ibsen",
        role: "Nurse",
        roleIconCls: "b-icon b-fa-user-nurse",
        calendar: "allday",
        image: "dave"
      },
      {
        id: 4,
        name: "Linda von Schmitt",
        role: "Doctor",
        roleIconCls: "b-icon b-fa-user-md",
        calendar: "seconddayhalf",
        image: "linda"
      },
      {
        id: 5,
        name: "Barbara Streisand",
        role: "Doctor",
        roleIconCls: "b-icon b-fa-user-md",
        calendar: "allday",
        image: "emilia"
      },
      {
        id: 6,
        name: "Michael Wolf",
        role: "Nurse",
        roleIconCls: "b-icon b-fa-user-md",
        calendar: "allday",
        image: "george"
      },
      {
        id: 7,
        name: "Lee Wong",
        role: "Nurse",
        roleIconCls: "b-icon b-fa-user-nurse",
        calendar: "allday",
        image: "lee"
      },
      {
        id: 8,
        name: "Madison Vik",
        role: "Nurse",
        roleIconCls: "b-icon b-fa-user-md",
        calendar: "seconddayhalf",
        image: "madison"
      }
    ]
  },
  events: {
    rows: [
      {
        id: 1,
        name: "Hip replacement",
        iconCls: "b-fa b-fa-stethoscope",
        patient: "Sarah Larson",
        confirmed: true,
        duration: 2,
        eventColor: "red",
        requiredRole: "Doctor"
      },
      {
        id: 2,
        name: "Annual checkup",
        iconCls: "b-fa b-fa-stethoscope",
        patient: "Dave Mathews",
        duration: 0.5,
        eventColor: "green",
        requiredRole: "Nurse"
      },
      {
        id: 3,
        name: "Moderna #2",
        iconCls: "b-fa b-fa-syringe",
        patient: "Kevin Bell",
        confirmed: true,
        duration: 0.5,
        eventColor: "blue",
        requiredRole: "Nurse"
      },
      {
        id: 4,
        name: "Pfizer #1",
        iconCls: "b-fa b-fa-syringe",
        patient: "Doug Williams",
        confirmed: true,
        duration: 0.5,
        eventColor: "blue",
        requiredRole: "Nurse"
      },
      {
        id: 5,
        name: "Heart transplant",
        iconCls: "b-fa b-fa-heart",
        patient: "Fred Dermot",
        confirmed: true,
        duration: 5,
        eventColor: "red",
        requiredRole: "Doctor"
      },
      {
        id: 6,
        name: "Sputnik #1",
        iconCls: "b-fa b-fa-syringe",
        patient: "Peter Ball",
        confirmed: true,
        duration: 0.5,
        eventColor: "blue",
        requiredRole: "Nurse"
      },
      {
        id: 7,
        name: "Vaccination",
        iconCls: "b-fa b-fa-syringe",
        patient: "Lara Kraft",
        confirmed: true,
        duration: 0.5,
        eventColor: "blue",
        requiredRole: "Nurse"
      },
      {
        id: 8,
        name: "Vaccination",
        iconCls: "b-fa b-fa-syringe",
        patient: "Randy Barth",
        confirmed: true,
        duration: 0.5,
        eventColor: "blue",
        requiredRole: "Nurse"
      },
      {
        id: 9,
        name: "Moderna #1",
        iconCls: "b-fa b-fa-syringe",
        patient: "Peter Douglas",
        duration: 0.5,
        eventColor: "blue",
        requiredRole: "Nurse"
      },
      {
        id: 10,
        name: "Pfizer #2",
        iconCls: "b-fa b-fa-syringe",
        patient: "Fanny White",
        confirmed: true,
        duration: 0.5,
        eventColor: "blue",
        requiredRole: "Nurse"
      },
      {
        id: 11,
        name: "Vaccination",
        iconCls: "b-fa b-fa-syringe",
        patient: "Gordon Anderson",
        duration: 0.5,
        requiredRole: "Nurse"
      },
      {
        id: 12,
        name: "Brain transplant",
        iconCls: "b-fa b-fa-brain",
        patient: "Frank Enstein",
        confirmed: true,
        duration: 3,
        requiredRole: "Doctor"
      },
      {
        id: 13,
        name: "Radiation therapy",
        iconCls: "b-fa b-fa-radiation",
        patient: "Katie Person",
        confirmed: true,
        duration: 2,
        requiredRole: "Radiation oncology nurse"
      }
    ]
  },
  assignments: {
    rows: []
  },
  dependencies: {
    rows: []
  }
};
