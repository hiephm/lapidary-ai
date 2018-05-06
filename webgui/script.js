var background_colours = {
    'white': '#ffffff',
    'blue': '#bbbbff',
    'red': '#ffbbbb',
    'green': '#bbffbb',
    'black': '#aaaaaa',
    'gold': '#ffffbb',
};

var border_colours = {
    'white': 'lightgrey',
    'blue': 'blue',
    'red': 'red',
    'green': 'green',
    'black': 'black',
    'gold': 'gold',
};


// shuffle function from https://bost.ocks.org/mike/algorithms/#shuffling
function shuffle(array) {
    var n = array.length, t, i;
    while (n) {
        i = Math.random() * n-- | 0; // 0 ≤ i < n
        t = array[n];
        array[n] = array[i];
        array[i] = t;
    }
    return array;
}

class GemsList {
    constructor(gems) {
        if (gems instanceof GemsList) {
            gems = gems.gems;
        }
        this.gems = gems;

        for (var i = 0, size = colours.length; i < size; i++) {
            var colour = colours[i];
            if (!(colour in this.gems)) {
                this.gems[colour] = 0;
            }
        }
    }

    add(gemslist) {
        for (var i = 0, size = colours.length; i < size; i++) {
            var colour = colours[i];
            this.gems[colour] += gemslist.gems[colour];
        }
    }
}



var test_state = new GameState();


Vue.component('gems-table', {
    props: ['gems', 'cards', 'show_card_count'],
    template: `
<table class="gems-table">
  <tr>
    <gems-table-gem-counter v-for="(number, colour) in gems"
        v-bind:key="colour"
        v-bind:colour="colour"
        v-bind:number="number">
    </gems-table-gem-counter>
  </tr>
  <tr v-if="show_card_count">
    <gems-table-card-counter v-for="(number, colour) in cards"
        v-bind:key="colour"
        v-bind:colour="colour"
        v-bind:number="number">
    </gems-table-card-counter>
  </tr>
</table>
`
});

Vue.component('gems-table-gem-counter', {
    props: ['colour', 'number'],
    computed: {
        border_colour: function() {
            return border_colours[this.colour];
        },
        background_colour: function() {
            return background_colours[this.colour];
        }
    },
    template: `
<td class="gems-table-gem-counter"
    v-bind:style="{background: background_colour, borderColor: border_colour}">
  {{ number }}
</td>
`
});

Vue.component('gems-table-card-counter', {
    props: ['colour', 'number'],
    computed: {
        border_colour: function() {
            return border_colours[this.colour];
        },
        background_colour: function() {
            return background_colours[this.colour];
        }
    },
    template: `
<td class="gems-table-card-counter"
    v-bind:style="{background: background_colour, borderColor: border_colour}">
  {{ number }}
</td>
`
});


Vue.component('gems-list', {
    props: {gems: {},
            title: "",
            display_zeros: {default: true}},
    template: `
<div class="gems-list">
    <h3 v-if="title">{{ title }}</h3>
    <ul>
    <gem-counter 
        v-for="(number, colour) in gems"
        v-bind:key="colour"
        v-bind:colour="colour"
        v-bind:number="number"
        style="font-size:2vh;"
        v-if="number > 0 || display_zeros">
    </gem-counter>
    </ul>
</div>`
});

Vue.component('gem-counter', {
    props: ['colour', 'number'],
    computed: {
        border_colour: function() {
            return border_colours[this.colour];
        },
        background_colour: function() {
            return background_colours[this.colour];
        }
    },
    template: `
<li class="gem-counter" 
    v-bind:style="{background: background_colour, borderColor: border_colour}">
  {{ number }}
</li>
`
});

Vue.component('gem-discarder', {
    props: ['player', 'gems_discarded', 'player_gems'],
    methods: {
        discard_gems: function() {
            this.$emit('discard_gems');
        }
    },
    template: `
<div class="gem-discarder">
  <h3>discard gems</h3>
  <gem-discarder-table v-bind:gems_discarded="gems_discarded"
                       v-bind:player_gems="player.gems">
  </gem-discarder-table>
  <button v-on:click="discard_gems()">
    confirm discards
  </button>
</div>
`
});

Vue.component('gem-discarder-table', {
    props: ['player_gems', 'gems_discarded'],
    methods: {
        increment(colour) {
            this.player_gems[colour] += 1;
            this.gems_discarded[colour] -= 1;
        },
        decrement(colour) {
            this.player_gems[colour] -= 1;
            this.gems_discarded[colour] += 1;
        }
    },
    computed: {
        total_player_gems: function() {
            let total_gems = 0;
            for (let colour of all_colours) {
                total_gems += this.player_gems[colour];
            }
            return total_gems;
        },
        can_increment: function() {
            let incrementable = {};
            for (let colour of all_colours) {
                incrementable[colour] = this.gems_discarded[colour] > 0;
            }
            return incrementable;
        },
        can_decrement: function() {
            let decrementable = {};
            let total_gems = this.total_player_gems;
            for (let colour of all_colours) {
                decrementable[colour] = total_gems > 10 && this.player_gems[colour] > 0;
            }
            return decrementable;
        }
    },
    template: `
<table class="gem-discarder-table">
  <tr>
    <td>
        current gems
    </td>
    <gems-table-gem-counter v-for="(number, colour) in player_gems"
        v-bind:key="colour"
        v-bind:colour="colour"
        v-bind:number="number">
    </gems-table-gem-counter>
  </tr>
  <tr>
    <td>
    </td>
    <increment-button v-for="(number, colour) in player_gems"
                      v-bind:key="colour"
                      v-bind:enabled="can_increment[colour]"
                      v-on:increment="increment($event)"
                      v-bind:colour="colour">
 e  </increment-button>
  </tr>
  <tr>
    <td>
    </td>
    <decrement-button v-for="(number, colour) in player_gems"
                      v-bind:key="colour"
                      v-bind:enabled="can_decrement[colour]"
                      v-on:decrement="decrement($event)"
                      v-bind:colour="colour">
    </decrement-button>
  </tr>
  <tr>
    <td>
        discarded gems
    </td>
    <gems-table-gem-counter v-for="(number, colour) in gems_discarded"
        v-bind:key="colour"
        v-bind:colour="colour"
        v-bind:number="number">
    </gems-table-gem-counter>
  </tr>
</table>
`
});

Vue.component('move-maker', {
    props: ['player', 'supply_gems', 'gems'],
    // data: function() {
    //     return {
    //         gems: {white: 0,
    //                blue: 0,
    //                green: 0,
    //                red: 0,
    //                black: 0,
    //                gold: 0},
    //     };
    // },
    methods: {
        take_gems: function() {
            this.$emit('take_gems', this.gems);
        }
    },
    computed: {
        any_gems_selected: function() {
            var any_gems_in_supply = false;
            for (let colour of colours) {
                if (this.supply_gems[colour] > 0) {
                    any_gems_in_supply = true;
                    break;
                }
            }

            if (!any_gems_in_supply) {
                return true;  // no gems in supply, so can 'take gems'
                              // without selecting any
            }

            var any_selected = false;
            for (let colour of colours) {
                if (this.gems[colour] > 0) {
                    any_selected = true;
                    break;
                }
            }
            return any_selected;
        }
    },
    template: `
<div class="move-maker">
  <h3>take gems</h3>
  <gem-selector v-bind:supply_gems="supply_gems"
                v-bind:gems="gems">
  </gem-selector>
  <button v-on:click="take_gems()"
          v-bind:disabled="!any_gems_selected && false">
    take gems
  </button>
</div>
`
});

Vue.component('gem-selector', {
    props: ['supply_gems', 'gems'],
    computed: {
        can_increment: function() {
            var any_value_2 = false;
            var num_values_1 = 0;
            for (var i = 0; i < colours.length; i++) {
                var colour = colours[i];
                if (this.gems[colour] >= 2) {
                    any_value_2 = true;
                }
                if (this.gems[colour] == 1) {
                    num_values_1 += 1;
                }
            }
            var incrementable = {};
            for (var i = 0; i < colours.length; i++) {
                var colour = colours[i];
                incrementable[colour] = !any_value_2 && (
                    (num_values_1 == 1 && this.gems[colour] == 1 && this.supply_gems[colour] > 3) || 
                        ((num_values_1 < 3) && this.supply_gems[colour] > 0 && this.gems[colour] == 0));
            }
            return incrementable;
        },
        can_decrement: function() {
            var decrementable = {};
            for (var i = 0; i < colours.length; i++) {
                var colour = colours[i];
                decrementable[colour] = (this.gems[colour] > 0);
            }
            return decrementable;
        }
    },
    template: `
<table class="gem-selector">
  <tr>
    <gems-table-gem-counter v-for="(number, colour) in gems"
        v-bind:key="colour"
        v-bind:colour="colour"
        v-bind:number="number">
    </gems-table-gem-counter>
  </tr>
  <tr>
    <increment-button v-for="(number, colour) in gems"
                      v-bind:key="colour"
                      v-bind:enabled="can_increment[colour]"
                      v-on:increment="gems[$event] += 1"
                      v-bind:colour="colour">
    </increment-button>
  </tr>
  <tr>
    <decrement-button v-for="(number, colour) in gems"
                      v-bind:key="colour"
                      v-bind:enabled="can_decrement[colour]"
                      v-on:decrement="gems[$event] -= 1"
                      v-bind:colour="colour">
    </decrement-button>
  </tr>
</table>
`
});

Vue.component('increment-button', {
    props: ['colour', 'enabled'],
    template: `
<td class="increment-button">
  <button v-bind:disabled="!enabled"
          v-on:click="$emit('increment', colour)">
    +
  </button>
</td>
`
});

Vue.component('decrement-button', {
    props: ['colour', 'enabled'],
    template: `
<td class="decrement-button">
  <button v-bind:disabled="!enabled"
          v-on:click="$emit('decrement', colour)">
    -
  </button>
</td>
`
});

Vue.component('player-display', {
    props: ['player', 'is_current_player', 'show_card_buttons'],
    computed: {
        player_num_gems: function() {
            return (this.player.gems['white'] +
                    this.player.gems['blue'] +
                    this.player.gems['green'] +
                    this.player.gems['red'] +
                    this.player.gems['black'] +
                    this.player.gems['gold']);
        },
        border_width: function() {
            if (this.is_current_player) {
                return "6px";
            }
            return "5px";
        },
        border_colour: function() {
            if (this.is_current_player) {
                return 'green';
            }
            return '#bbeebb';
        },
        background_colour: function() {
            if (this.is_current_player) {
                return '#eeffee';
            }
            return '#ffffee';
        }
    },
    template: `
<div class="player-display"
     v-bind:style="{borderWidth: border_width,borderColor: border_colour,backgroundColor: background_colour}">
<h3>Player {{ player.number }}: {{ player.score }} points, {{ player_num_gems }} gems</h3>
    <gems-table v-bind:gems="player.gems"
                v-bind:show_card_count="true"
                v-bind:cards="player.card_colours">
    </gems-table>
    <cards-display v-show="player.cards_in_hand.length > 0"
                   v-bind:cards="player.cards_in_hand"
                   v-bind:player="player"
                   v-bind:num_cards="3"
                   tier="hand"
                   v-bind:show_card_buttons="show_card_buttons"
                   v-bind:show_reserve_button="false"
                   style="height:180px;min-height:180px"
                   v-on:buy="$emit('buy', $event)">
    </cards-display>
</div>
`
})

Vue.component('cards-display', {
    props: ['cards', 'name', 'tier', 'player', 'show_reserve_button', 'num_cards', 'show_card_buttons'],
    methods: {
        reserve: function(card) {
            var card_index;
            for (var i = 0; i < this.cards.length; i++) {
                if (this.cards[i] === card) {
                    card_index = i;
                }
            }
            this.$emit('reserve', [this.tier, card_index]);
        },
        buy: function(card) {
            var card_index;
            for (var i = 0; i < this.cards.length; i++) {
                if (this.cards[i] === card) {
                    card_index = i;
                }
            }
            this.$emit('buy', [this.tier, card_index, this.player.can_afford(card)[1]]);
        }
    },
    computed: {
        card_width: function() {
            return ((100 - this.num_cards * 2) / this.num_cards).toString() + '%';
        }
    },
    template: `
<div class="cards-display">
    <h3>{{ name }}</h3>
    <ul class="single-line-list">
      <card-display
          v-bind:style="{width:card_width,maxWidth:card_width,minWidth:card_width}"
          v-for="card in cards"
          v-bind:show_reserve_button="show_reserve_button"
          v-bind:show_card_buttons="show_card_buttons"
          v-bind:player="player"
          v-bind:key="card.id"
          v-bind:card="card" 
          v-on:buy="buy($event)"
          v-on:reserve="reserve($event)">
      </card-display>
    </ul>
</div>
`
});

Vue.component('card-display', {
    props: ['card', 'player', 'show_reserve_button', 'show_card_buttons'],
    computed: {
        background_colour: function() {
            return background_colours[this.card.colour];
        },
        buyable: function() {
            return this.player.can_afford(this.card)[0];
        },
        reservable: function() {
            return (this.player.cards_in_hand.length < 3);
        },
    },
    template: `
<li class="card-display">
<div class="card-display-contents" v-bind:style="{backgroundColor: background_colour}">
    <p class="card-points">{{ card.points }}</p>
    <button class="reserve-button"
            v-if="show_reserve_button && show_card_buttons && reservable"
            v-bind:disabled="!reservable"
            v-on:click="$emit('reserve', card)">
        reserve
    </button>
    <button class="buy-button"
            v-if="show_card_buttons && buyable"
            v-bind:disabled="!buyable"
            v-on:click="$emit('buy', card)">
        buy
    </button>
    <gems-list v-bind:gems="card.gems" 
               v-bind:display_zeros="false">
    </gems-list>
</div>
</li>
`
});


Vue.component('card-display-table-row', {
    props: ['colour', 'number', 'other'],
    template: `
<tr>
  <td>
    <gem-counter v-bind:colour="colour"
                 v-bind:number="number">
    </gem-counter>
  </td>
</tr>
`
});

Vue.component('supply-display', {
    props: ['gems', 'show_card_count'],
    computed: {
        num_gems: function() {
            let total = 0;
            for (let colour of colours) {
                total += this.gems[colour];
            }
            return total;
        }
    },
    template: `
<div class="supply-display">
    <h3>Supply: {{ num_gems }} coloured gems</h3>
    <gems-table v-bind:gems="gems"
                v-bind:show_card_count="show_card_count">
    </gems-table>
</div>
`
});

var app = new Vue({
    el: '#app',
    data: {
        state: test_state,
        human_player_index: 0,
        player_type: 'human',
        discarding: false,
        gems_selected: {'white': 0,
                        'blue': 0,
                        'green': 0,
                        'red': 0,
                        'black': 0,
                        'gold': 0},
        gems_discarded: {'white': 0,
                         'blue': 0,
                         'green': 0,
                         'red': 0,
                         'black': 0,
                         'gold': 0}
    },
    methods: {
        testChangeGems: function() {
            this.state.reduce_gems();
        },
        test_change_player_type: function() {
            if (this.player_type === 'human') {
                this.player_type = 'ai';
            } else {
                this.player_type = 'human';
            }

            for (var i = 0; i < colours.length; i++) {
                this.gems_selected[colours[i]] = 0;
            }
        },
        test_moves: function() {
            console.log(this.state.get_valid_moves());
        },
        reset: function() {
            this.state = new GameState();
            this.player_type = 'human';
            this.discarding = false;
        } ,
        do_move_gems: function(info) {
            this.state.make_move({action: 'gems',
                                  gems: this.gems_selected},
                                 false);
            for (let colour of colours) {
                this.gems_selected[colour] = 0;
            }

            this.check_if_discarding();
        },
        do_move_reserve: function(info) {
            var gold_taken = 0;
            if (this.state.supply_gems['gold'] > 0) {
                gold_taken = 1;
            }
            this.state.make_move({action: 'reserve',
                                  tier: info[0],
                                  index: info[1],
                                  gems: {'gold': gold_taken}},
                                 false);
            this.check_if_discarding();
        },
        do_move_buy: function(info) {
            let tier = info[0];
            if (tier === 'hand') {
                this.state.make_move({action: 'buy_reserved',
                                      tier: info[0],
                                      index: info[1],
                                      gems: info[2]},
                                     false);
            } else {
                this.state.make_move({action: 'buy_available',
                                      tier: info[0],
                                      index: info[1],
                                      gems: info[2]},
                                     false);
            }
            this.check_if_discarding();
        },
        check_if_discarding() {
            let player = this.human_player;
            if (player.total_num_gems() > 10) {
                this.discarding = true;
            } else {
                this.discarding = false;
                this.state.increment_player();
            }
        },
        do_discard_gems: function() {
            let player = this.current_player;
            let state = this.state;
            for (let colour of all_colours) {
                // player.gems[colour] -= this.gems_discarded[colour];
                state.supply_gems[colour] += this.gems_discarded[colour];
                this.gems_discarded[colour] = 0;
            }
            this.check_if_discarding();
        }
    },
    computed: {
        current_player: function() {
            return this.state.players[this.state.current_player_index];
        },
        human_player: function() {
            return this.state.players[0];
        },
        round_number: function() {
            return this.state.round_number;
        },
        supply_gems: function() {
            return this.state.supply_gems;
        },
        players: function() {
            return this.state.players;
        },
        indexed_players: function() {
            var players = {};
            for (let i = 0; i < this.num_players; i++) {
                players[i] = this.players[i];
            }
            return players;
        },
        show_card_buttons: function() {
            return !this.discarding && this.player_type === 'human';
        }
    }
});

