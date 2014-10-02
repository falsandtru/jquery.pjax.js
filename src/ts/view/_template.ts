/// <reference path="../define.ts"/>

/* VIEW */

module MODULE.VIEW {

  export class Template {

    constructor(state: State) {
      this.state_ = state;
    }

    /**
     * UUID
     * 
     * @property UUID
     * @type String
     */
    UUID: string = GEN_UUID()
    
    /**
     * Viewの遷移状態を持つ
     * 
     * @property state_
     * @type {State}
     */
    state_: State = State.blank

  }

}
