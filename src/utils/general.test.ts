import Player from "$game/objects/player";
import BasicBrain from "src/brains/basic";
import { deepClone } from "./general";
import { expect, test } from "bun:test";

// Test deepClone function
class TestClass1{
    testString: string = "test";
    subTestClass: SubTestClass;

    constructor(){
        this.subTestClass = new SubTestClass();
    }

    updateString(newString: string){
        this.testString = newString;
    }
}
class SubTestClass{
    testString: string;

    constructor(){
        this.testString = "test";
    }

    updateString(newString: string){
        this.testString = newString;
    }
}

test("Deep clone objects have same data", () => {
    const one = new TestClass1();
    const clone = deepClone(one);

    const oneJson = JSON.stringify(one);
    const cloneJson = JSON.stringify(clone);

    expect(oneJson).toBe(cloneJson);
})

test("Deep clone objects are from same class and type", () => {
    const one = new TestClass1();
    const clone = deepClone(one);

    expect(one).toBeInstanceOf(TestClass1);
    expect(clone).toBeInstanceOf(TestClass1);

    expect(one.subTestClass).toBeInstanceOf(SubTestClass);
    expect(clone.subTestClass).toBeInstanceOf(SubTestClass);
})

test("Deep clone objects have all the methods", () => {
    const one = new TestClass1();
    const clone = deepClone(one);

    expect(one.updateString).toBeInstanceOf(Function);
    expect(clone.updateString).toBeInstanceOf(Function);

    expect(one.subTestClass.updateString).toBeInstanceOf(Function);
    expect(clone.subTestClass.updateString).toBeInstanceOf(Function);
})

test("Deep clone objects dont are linked when updating a property", () => {
    const one = new TestClass1();
    const clone = deepClone(one);

    one.updateString("new string");

    expect(one.testString).toBe("new string");
    expect(clone.testString).toBe("test");

    clone.updateString("new string2");
    expect(one.testString).toBe("new string");
    expect(clone.testString).toBe("new string2");
})

test("Deep clone works with ships", () => {
    const player = new Player("test", BasicBrain)
    const clone = deepClone(player);

    expect(player).toBeInstanceOf(Player);
    expect(clone).toBeInstanceOf(Player);
})