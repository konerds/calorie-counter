import { Model } from "@vuex-orm/core";

export default class Recipe extends Model {
  static entity = "recipes";
  static primaryKey = "id";
  static state() {
    return {
      fetching: false,
    };
  }
  static fields() {
    return {
      id: this.attr(null),
      creator: this.attr(""),
      name: this.attr(""),
      method: this.attr(""),
      type: this.attr(""),
      calorie: this.attr(""),
      carb: this.attr(""),
      protein: this.attr(""),
      fat: this.attr(""),
      sodium: this.attr(""),
      smallImg: this.attr(""),
      largeImg: this.attr(""),
      ingredients: this.attr([]),
      steps: this.attr([]),
    };
  }
  static apiConfig = {
    actions: {
      fetch() {
        return this.get("recipes.json", {
          dataTransformer: (response) => {
            const recipes = [];
            for (let i = 0; i < response.data.length; i++) {
              if (response.data[i] !== null) {
                const ingredients = [];
                for (let index in response.data[i]) {
                  if (index === "ingredients") {
                    for (let ingredientIndex in response.data[i][index]) {
                      if (
                        response.data[i][index][ingredientIndex].name.length !==
                        0
                      ) {
                        if (
                          (response.data[i][index][
                            ingredientIndex
                          ].unit.includes("g") &&
                            !response.data[i][index][
                              ingredientIndex
                            ].unit.includes("/")) ||
                          (response.data[i][index][
                            ingredientIndex
                          ].unit.includes("ml") &&
                            !response.data[i][index][
                              ingredientIndex
                            ].unit.includes("/")) ||
                          (response.data[i][index][
                            ingredientIndex
                          ].unit.includes("mL") &&
                            !response.data[i][index][
                              ingredientIndex
                            ].unit.includes("/"))
                        ) {
                          ingredients.push({
                            name: response.data[i][index][ingredientIndex].name,
                            unit: response.data[i][index][ingredientIndex].unit
                              .replace(/[^0-9]/g, "")
                              .replace(/(^0+)/g, ""),
                          });
                        } else {
                          ingredients.push({
                            name: response.data[i][index][ingredientIndex].name,
                            unit: response.data[i][index][ingredientIndex].unit,
                          });
                        }
                      }
                    }
                  }
                }
                recipes.push({
                  id: response.data[i].id,
                  creator: response.data[i].creator,
                  name: response.data[i].name,
                  method: response.data[i].method,
                  type: response.data[i].type,
                  calorie: response.data[i].calorie,
                  carb: response.data[i].carb,
                  protein: response.data[i].protein,
                  fat: response.data[i].fat,
                  sodium: response.data[i].sodium,
                  smallImg: response.data[i].smallImg,
                  largeImg: response.data[i].largeImg,
                  ingredients: ingredients,
                  steps: response.data[i].steps,
                });
              }
            }
            return recipes;
          },
        });
      },
      createRecipe(payload) {
        return this.put(
          `recipes/${payload.index}.json?auth=` + payload.token,
          payload.data
        );
      },
      updateRecipe(payload) {
        return this.patch(
          `recipes/${payload.index}.json?auth=` + payload.token,
          payload.data
        );
      },
      deleteRecipe(index, token) {
        return this.delete(`recipes/${index}.json?auth=` + token, {
          delete: index,
        });
      },
    },
  };
}
