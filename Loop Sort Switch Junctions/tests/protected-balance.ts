// Previous accepted configurations: protected by this iteration.
export const protectedBalance = [
  {
    id: 1,
    capacity: 3,
    initialJunctionState: "GREEN",
    containers: [
      {
        id: "C1",
        capacity: 2,
        orderedBlocks: ["red", "blue"],
        position: {
          x: 100,
          y: 82,
        },
        opening: "bottom",
        interaction: {
          segment: "A0",
          at: 0.14,
        },
      },
      {
        id: "C2",
        capacity: 2,
        orderedBlocks: ["blue", "red"],
        position: {
          x: 320,
          y: 550,
        },
        opening: "top",
        interaction: {
          segment: "B1",
          at: 0.14,
        },
      },
    ],
  },
  {
    id: 2,
    capacity: 4,
    initialJunctionState: "GREEN",
    containers: [
      {
        id: "C1",
        capacity: 2,
        orderedBlocks: ["red", "blue"],
        position: {
          x: 100,
          y: 82,
        },
        opening: "bottom",
        interaction: {
          segment: "A0",
          at: 0.14,
        },
      },
      {
        id: "C2",
        capacity: 2,
        orderedBlocks: ["blue", "green"],
        position: {
          x: 320,
          y: 82,
        },
        opening: "bottom",
        interaction: {
          segment: "B1",
          at: 0.86,
        },
      },
      {
        id: "C3",
        capacity: 2,
        orderedBlocks: ["green", "red"],
        position: {
          x: 100,
          y: 550,
        },
        opening: "top",
        interaction: {
          segment: "A0",
          at: 0.86,
        },
      },
    ],
  },
  {
    id: 3,
    capacity: 4,
    initialJunctionState: "GREEN",
    containers: [
      {
        id: "C1",
        capacity: 3,
        orderedBlocks: ["red", "blue", "green"],
        position: {
          x: 90,
          y: 82,
        },
        opening: "bottom",
        interaction: {
          segment: "A0",
          at: 0.13,
        },
      },
      {
        id: "C2",
        capacity: 3,
        orderedBlocks: ["blue", "green", "red"],
        position: {
          x: 330,
          y: 82,
        },
        opening: "bottom",
        interaction: {
          segment: "B1",
          at: 0.87,
        },
      },
      {
        id: "C3",
        capacity: 3,
        orderedBlocks: ["green", "red", "blue"],
        position: {
          x: 90,
          y: 550,
        },
        opening: "top",
        interaction: {
          segment: "A0",
          at: 0.87,
        },
      },
    ],
  },
  {
    id: 4,
    capacity: 4,
    initialJunctionState: "GREEN",
    containers: [
      {
        id: "C1",
        capacity: 3,
        orderedBlocks: ["red", "green", "blue"],
        position: {
          x: 100,
          y: 82,
        },
        opening: "bottom",
        interaction: {
          segment: "A0",
          at: 0.16,
        },
      },
      {
        id: "C2",
        capacity: 3,
        orderedBlocks: ["blue", "yellow", "red"],
        position: {
          x: 320,
          y: 82,
        },
        opening: "bottom",
        interaction: {
          segment: "B1",
          at: 0.82,
        },
      },
      {
        id: "C3",
        capacity: 3,
        orderedBlocks: ["green", "blue", "yellow"],
        position: {
          x: 100,
          y: 550,
        },
        opening: "top",
        interaction: {
          segment: "A0",
          at: 0.84,
        },
      },
      {
        id: "C4",
        capacity: 3,
        orderedBlocks: ["yellow", "red", "green"],
        position: {
          x: 320,
          y: 550,
        },
        opening: "top",
        interaction: {
          segment: "B1",
          at: 0.18,
        },
      },
    ],
  },
  {
    id: 6,
    capacity: 3,
    initialJunctionState: "GREEN",
    containers: [
      {
        id: "C1",
        capacity: 3,
        orderedBlocks: ["red", "yellow", "blue"],
        position: {
          x: 100,
          y: 82,
        },
        opening: "bottom",
        interaction: {
          segment: "A0",
          at: 0.23,
        },
      },
      {
        id: "C2",
        capacity: 3,
        orderedBlocks: ["yellow", "green", "red"],
        position: {
          x: 320,
          y: 82,
        },
        opening: "bottom",
        interaction: {
          segment: "B1",
          at: 0.82,
        },
      },
      {
        id: "C3",
        capacity: 3,
        orderedBlocks: ["green", "blue", "yellow"],
        position: {
          x: 320,
          y: 550,
        },
        opening: "top",
        interaction: {
          segment: "B1",
          at: 0.22,
        },
      },
      {
        id: "C4",
        capacity: 3,
        orderedBlocks: ["blue", "red", "green"],
        position: {
          x: 100,
          y: 550,
        },
        opening: "top",
        interaction: {
          segment: "A0",
          at: 0.78,
        },
      },
    ],
  },
];
