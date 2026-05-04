// CONFIG
      const CONFIG = {
        SAVE_KEY: "worm_sort_save_v1",
        MAX_CAMPAIGN_LEVEL: 100,
        START_BLOCKS_PER_CONTAINER: 10,
        SMALL_CONTAINER_CAPACITY: 5,
        NORMAL_CONTAINER_CAPACITY: 10,
        LARGE_CONTAINER_CAPACITY: 15,
        MAX_CONTAINER_COUNT: 8,
        COLORS: {
          red: "#ff5f6d",
          blue: "#4594ff",
          green: "#35c982",
          yellow: "#f5c84b",
          purple: "#9b6cff",
          orange: "#ff9b42",
          cyan: "#36c6d7",
          pink: "#ff78b7"
        },
        COLOR_ORDER: ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "pink"],
        ANIM: {
          flash: 0.34,
          toast: 2.7,
          stepCooldown: 0.11,
          victoryDelay: 0.55
        },
        INPUT: {
          dragThreshold: 18,
          pointerStepInterval: 0.085,
          keyboardStepInterval: 0.105,
          pointerBias: 0.02
        }
      };
      const DIRS = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
      };

