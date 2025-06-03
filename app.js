

class Car{
  constructor(name,price){
    this.name=name
    this.price=price
  }
  person(){
    return this.name + this.price
  }
}


class Person{
  constructor(name) {
      this.name=name
  }

  printName(){
    return this.name
  }
}