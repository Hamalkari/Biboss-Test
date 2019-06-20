(() => {
  let form = document.getElementById('form');
  let nameField = form.querySelector('#name');
  let telephoneField = form.querySelector('#telephone');
  let franchiseField = form.querySelector('#franchise');
  let autocompleteField = form.querySelector('.autocomplete');
  let button = form.querySelector('#btn');

 
  franchiseField.addEventListener('input',franchiseHandler);
  form.addEventListener('input',inputHadnler);
  form.addEventListener('submit',formHandler);


  function inputHadnler(e){
    let nameValue = nameField.value;
    let telephoneValue = telephoneField.value;
    let franchiseValue = franchiseField.value;

    if (!nameValue || !telephoneValue || !franchiseValue){
      button.disabled = 'disabled';
      button.classList.add('form__btn--disabled');
    }else{
      button.disabled = '';
      button.classList.remove("form__btn--disabled");
    }
  }


  function formHandler(e){
    e.preventDefault();
    let telephoneValue = telephoneField.value;
    let regTel = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/;
    if (!regTel.test(telephoneValue)){
      telephoneField.classList.add('form__input--error');
      let error = createError('Укажите правильный телефон');
      telephoneField.insertAdjacentElement('afterend',error);
      setTimeout(() => {
        error.remove();
        telephoneField.classList.remove('form__input--error');
      },2000);
    }
  }


  function franchiseHandler(e){
    const autocompleteList = ['Про','Проворный ткачик','ПРОФИ-СПОРТ','Проспект','Просто Чудо',"Прокат Пони+"];
    let franchiseValue = franchiseField.value;

    if (franchiseValue){
      const reg = new RegExp(`^${franchiseValue}`,'i');
      const matchList = autocompleteList.filter(item => {
        return reg.test(item);
      });
  
      if (matchList.length != 0){
        toggleAutocompleteField('show');
        autocompleteField.innerHTML = '';
        matchList.forEach(item => {
          let autocompleteItem = createAutocomleteItem(item);
          autocompleteField.insertAdjacentElement('beforeend',autocompleteItem);
          autocompleteItem.addEventListener('mousedown',autocompleteItemHandler);
        })
      }
    }
  }

  function autocompleteItemHandler(){
    franchiseField.value = this.innerHTML;
    toggleAutocompleteField('hide');
  }

  function toggleAutocompleteField(status){
    if (status == 'hide'){
      autocompleteField.classList.add('hide');
    }
    if (status == 'show'){
      autocompleteField.classList.remove('hide');
    }
  }

  function createAutocomleteItem(text){
    let item = document.createElement('li');
    item.className = 'autocomplete__item';
    item.innerHTML = text;
    return item;
  }
  function createError(title){
    let error = document.createElement('div');
    error.className = 'error';
    error.innerHTML = title;
    return error;
  }
})()