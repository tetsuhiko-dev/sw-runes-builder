const monstersJson = require('../datas/monsters.json');
const runeUpgradeJson = require('../datas/runeUpgrade.json');
const runeEffectJson = require('../datas/runeEffect.json');
const _ = require('lodash')

const baseArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


class Monsters {
    #monsters;
    
    constructor() {
        this.#monsters = monstersJson;
    }

    filter(name, element, starStr) {
        let star = parseInt(starStr);
        return this.#monsters.filter(monster => this.#filterFunc(monster, name, element, starStr)).sort(this.#sort);
    }

    get(idStr) {
        let id = parseInt(idStr);
        return this.#monsters.find(monster => monster.Id === id);
    }

    #filterFunc(monster, name, element, starStr) {
        let useName = name?.length !== 0;
        let useElement = element?.length !== 0;
        let useStar = starStr?.length !== 0;
        let star = useStar ? parseInt(starStr) : null;

        let checkName = monster.Name.toLowerCase().includes(name);
        let checkNameAwaken = monster.NameAwaken.toLowerCase().includes(name);
        let checkElement = monster.Element === element;
        let checkStar = monster.Star === star;

        let result = true;

        if (useName) {
            result = result && (checkName || checkNameAwaken);
        }
        if (useElement) {
            result = result && checkElement;
        }
        if (useStar) {
            result = result && checkStar;
        }

        return result;
    }

    #sort(a, b) {
        if (a.Star > b.Star) return -1;
        if (a.Star < b.Star) return 1;

        if (a.Name < b.Name) return -1;
        if (a.Name > b.Name) return 1;

        if (a.NameAwaken < b.NameAwaken) return -1;
        if (a.NameAwaken > b.NameAwaken) return 1;
    }
}

class BonusStats {

    rune1;
    rune2;
    rune3;
    rune4;
    rune5;
    rune6;

    constructor() {
    }

    slot1(value) {
        this.rune1 = new Rune(1, value);
    }

    slot2(value) {
        this.rune2 = new Rune(2, value);
    }

    slot3(value) {
        this.rune3 = new Rune(3, value);
    }

    slot4(value) {
        this.rune4 = new Rune(4, value);
    }

    slot5(value) {
        this.rune5 = new Rune(5, value);
    }

    slot6(value) {
        this.rune6 = new Rune(6, value);
    }
    
    stats0(){
        return [this.rune1.rune.stat0.value,
            this.rune2.rune.stat0.value,
            this.rune3.rune.stat0.value,
            this.rune4.rune.stat0.value,
            this.rune5.rune.stat0.value,
            this.rune6.rune.stat0.value];
    }
    
    getBonusIndex(){
        let group = _.groupBy([this.rune1, this.rune2, this.rune3, this.rune4, this.rune5, this.rune6], "rune.type");
        let bonusIndex = [];
        Object.keys(group).forEach(keyStr => {
            let key = parseInt(keyStr);
            for(let i=0; key !== -1 && i<Math.floor(group[keyStr].length / runeEffectJson[key].count);i++){
                bonusIndex.push(key);
            }
        });
        return bonusIndex;
    }
    
    getBonusRunes() {
        let group = _.groupBy([this.rune1, this.rune2, this.rune3, this.rune4, this.rune5, this.rune6], "rune.type");
        let bonus = _.cloneDeep(baseArray);
        Object.keys(group).forEach(keyStr => {
           let key = parseInt(keyStr);
           if(key !== -1 && runeEffectJson[key].stat !== -1){
               bonus[runeEffectJson[key].stat] = runeEffectJson[key].value * Math.floor(group[keyStr].length / runeEffectJson[key].count);
           }
        });
        return bonus;
    }

    result() {
        return [this.rune1.getStatsArray(),this.rune2.getStatsArray(),this.rune3.getStatsArray(),
            this.rune4.getStatsArray(),this.rune5.getStatsArray(),this.rune6.getStatsArray(), this.getBonusRunes()].reduce((a, b) => a.map((c, i) => c + b[i]));
    }
}

class Rune {
    type;

    rune;

    constructor(slot, rune) {
        this.rune = rune;

        if (this.rune.stat0.id === -1) return;

        this.rune.stat0.value =
            this.rune.level === 15 ?
                runeUpgradeJson[this.rune.stat0.id][this.rune.star - 1].max :
                runeUpgradeJson[this.rune.stat0.id][this.rune.star - 1].base + runeUpgradeJson[this.rune.stat0.id][this.rune.star - 1].increment * this.rune.level;
    }

    getStatsArray() {
        let stats = _.cloneDeep(baseArray);
        
        if(this.rune.innate.id !== -1){
            stats[this.rune.innate.id] = this.rune.innate.value;
        }        
        if (this.rune.stat0.id !== -1) {
            stats[this.rune.stat0.id] = this.rune.stat0.value;
        }
        if (this.rune.stat1.id !== -1) {
            stats[this.rune.stat1.id] = this.rune.stat1.value;
        }
        if (this.rune.stat2.id !== -1) {
            stats[this.rune.stat2.id] = this.rune.stat2.value;
        }
        if (this.rune.stat3.id !== -1) {
            stats[this.rune.stat3.id] = this.rune.stat3.value;
        }
        if (this.rune.stat4.id !== -1) {
            stats[this.rune.stat4.id] = this.rune.stat4.value;
        }

        return stats;
    }
}

module.exports.Monsters = Monsters;
module.exports.BonusStats = BonusStats;