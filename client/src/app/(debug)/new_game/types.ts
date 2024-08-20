export enum Player {
    None = "None",
    P1 = "P1",
    P2 = "P2"
}

export type Game = {
    game_id: string,
    player_type: Player
}

export class NewGameResponse {
    game_id: string;
    player_type: Player;

    constructor(game_id: string = "", player: Player = Player.None) {
        this.game_id = game_id
        this.player_type = player
    }

    static from_json(object: Game): NewGameResponse {
        return new NewGameResponse(object.game_id, object.player_type)
    }

    is_empty(): boolean {
        return this.game_id === "" && this.player_type === Player.None
    }
}