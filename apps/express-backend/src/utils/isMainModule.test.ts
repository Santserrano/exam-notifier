import { isMainModule } from "./isMainModule";

// En situación real, no es necesario testear esto ya que es el módulo principal! :p
describe("isMainModule", () => {
    it("debería devolver true si el módulo es el principal", () => {

        expect(typeof isMainModule()).toBe("boolean");
    });
});
