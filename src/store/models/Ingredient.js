import { Model } from "@vuex-orm/core";

export default class Ingredient extends Model {
  static entity = "ingredients";
  static primaryKey = "id";
  static state() {
    return {
      fetching: false,
    };
  }
  static fields() {
    return {
      id: this.attr(null),
      name: this.attr(""),
      carbByUnit: this.attr(""),
      proteinByUnit: this.attr(""),
      fatByUnit: this.attr(""),
      sodiumByUnit: this.attr(""),
    };
  }
  static apiConfig = {
    actions: {
      fetch() {
        return this.get("ingredients.json", {
          dataTransformer: (response) => {
            const arrayIngredients = [];
            for (let i = 0; i < response.data.length; i++) {
              if (response.data[i] !== null) {
                arrayIngredients.push({
                  id: response.data[i].id,
                  name: response.data[i].name,
                  carbByUnit: response.data[i].carbByUnit,
                  proteinByUnit: response.data[i].proteinByUnit,
                  fatByUnit: response.data[i].fatByUnit,
                  sodiumByUnit: response.data[i].sodiumByUnit,
                });
              }
            }
            return arrayIngredients;
          },
        });
      },
      createIngredient(payload) {
        return this.put(
          `ingredients/${payload.index}.json?auth=` + payload.token,
          payload.data
        );
      },
      updateIngredient(payload) {
        return this.patch(
          `ingredients/${payload.index}.json?auth=` + payload.token,
          payload.data
        );
      },
      deleteIngredient(index, token) {
        return this.delete(`ingredients/${index}.json?auth=` + token, {
          delete: index,
        });
      },
    },
  };
}
