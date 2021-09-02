
//Đối tượng `validator`
function Validator(options) {

    var selectorRulesTest = {}

    //Hàm thực hiện validate 
    function validate(inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector); // dùng chung cho mọi rules
        var formGroup = inputElement.parentElement;
        var errorMessage;

        //Mảng chứa các rule.test của selector hiện tại
        var rules = selectorRulesTest[rule.selector]

        for(var i in rules) {
            errorMessage = rules[i](inputElement.value);
            if(errorMessage) break;
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            formGroup.classList.add(options.toggleClass)
        }else {
            errorElement.innerText = '';
            formGroup.classList.remove(options.toggleClass)
        }

        return !errorMessage;
    }

    //Lấy Element của form cần validate
    var formElement = document.querySelector(options.form)

        // console.log(options.rules)
    if(formElement) {
        //Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault()

            var isFormValid = true;
            //Lặp qua từng rule và validate
            options.rules.forEach((rule) => {
            var inputElement = formElement.querySelector(rule.selector)
              
            

            if(inputElement){
                var isValid = validate(inputElement,rule)

                if(!isValid) isFormValid = false; 
            }
            })
            console.log(formValues)

            if(isFormValid) {
                //Trường hợp submit với Javascript
                if(typeof options.onSubmit === 'function') {

                    // var enableInputs = formElement.querySelectorAll('[name]:not([disable])')
                    var enableInputs = formElement.querySelectorAll('[name]');

                    //Chuyển nodeList thành Array, sau đó duyệt qua reduce để cộng dồn thành Object với key và value tương ứng
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        return (values[input.name] = input.value) && values
                    },{})

                    options.onSubmit(formValues)
                }
                //Trường hợp submit với HTML submit mặc định
                else {
                    console.log('HTML submit')
                    formElement.submit()
                }
                
            }
        }

        //Lặp qua mỗi rule và xử lý( lắng nghe các sự kiện,....)
        options.rules.forEach((rule) => {
            //Lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRulesTest[rule.selector])) {
                selectorRulesTest[rule.selector].push(rule.test)
            }else{
                selectorRulesTest[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector)

            var errorElement = inputElement.parentElement.querySelector(options.errorSelector); // dùng chung cho mọi rules
            var formGroup = inputElement.parentElement;

            if(inputElement) {
                //Xử lý trường hợp blur ra ngoài
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }
                //Xử lý trường hợp nhập vào input
                inputElement.oninput = function() {
                    errorElement.innerText = '';
                    formGroup.classList.remove(options.toggleClass)
                }
            }
        })

        // console.log(selectorRulesTest)
    }
}

//_________________________________________________________________________________________________________________________________ */
//Định nghĩa rules
//Nguyên tắc của các rules
//1. Khi có lỗi => Message lỗi
//2. Khi hợp lệ => Không trả ra cái gì cả (undefined)
Validator.isRequired= function (selector, message) {
    return {
        selector : selector,
        test : function (value) {
            //Kiểm tra có nhập . tức value.trim() return ra True
            return value.trim() ? undefined : message|| 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector : selector,
        test : function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

            return regex.test(value) ? undefined : message|| 'Trường này phải là email'
        }
    }
}

Validator.minLength = function (selector, min, message ) {
    return {
        selector : selector,
        test : function (value) {
            return value.length >= min ? undefined : message||  `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector : selector,
        test : function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào chưa chính xác'
        }
    }
}
