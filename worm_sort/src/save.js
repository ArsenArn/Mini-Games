// Save
      const Save = {
        data: { unlockedLevel: 1 },
        load() {
          try {
            const raw = localStorage.getItem(CONFIG.SAVE_KEY);
            if (raw) this.data = { ...this.data, ...JSON.parse(raw) };
          } catch (error) {
            this.data = { unlockedLevel: 1 };
          }
        },
        write() {
          localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(this.data));
        },
        unlock(level) {
          this.data.unlockedLevel = Math.max(this.data.unlockedLevel || 1, Math.min(CONFIG.MAX_CAMPAIGN_LEVEL, level));
          this.write();
        }
      };

