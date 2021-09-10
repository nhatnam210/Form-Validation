
//Đối tượng `validator`
function Validator(options) {

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector))
                return element.parentElement;
            else
                element = element.parentElement
        }
    }

    var selectorRulesTest = {}

    //Hàm thực hiện validate 
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector); // dùng chung cho mọi rules
        var formGroup = getParent(inputElement, options.formGroupSelector);
        var errorMessage;

        //Mảng chứa các rule.test của selector hiện tại
        var rules = selectorRulesTest[rule.selector]

        for(var i in rules) {
            switch(inputElement.type) {
                case 'checkbox' :
                case 'radio' :
                    //Tới đây mới đích thị là khi kiếm đc bất kỳ thằng nào checked thì cho là đúng luôn
                    //Riêng thằng onsubmit thôi, vì chỉ cần duyệt một lần kiếm 1 thằng thôi
                    //Quan trọng là vì nó trùng rule.selector nên hơi lú thôi :))
                    //Vì dù có lặp qua bao nhiêu lần thì nó cũng chỉ kiếm đúng 1 thằng duy nhất checked thôi (querySelector)
                    //Vậy nên không cần lặp chi cho mệt :)))
                    var checkedInput = formElement.querySelector(rule.selector + ':checked')

                    //Nếu ko checked thì trả ra null, mà null ko thể .trim() nên lỗi
                    //Vậy nên cần bắt trường hợp khi checked không tồn tại nào thì mặc định = ''
                    //Để khi đút xuống test sẽ lấy cái '' đi test --> tất nhiên sai
                    errorMessage = rules[i](
                        checkedInput ? checkedInput : ''
                        );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }

            if(errorMessage) break;
        }

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            formGroup.classList.add(options.toggleClass)
        }
        // else {
        //     errorElement.innerText = '';
        //     formGroup.classList.remove(options.toggleClass)
        // }

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

                //Đơn giản nếu truyền vào là thằng checkox vs radio nó không cần dùng tới value để xét
                //Nó chỉ lợi dụng inputElement để xét kiểu (type), 
                //nếu (checkox vs radio) thì kiểm tra checked hoặc chưa thôi
                if(inputElement){
                    var isValid = validate(inputElement,rule)
                    if(!isValid) isFormValid = false; 
                }
            })    


            if(isFormValid) {
                //Trường hợp submit với Javascript
                if(typeof options.onSubmit === 'function') {
                    // var enableInputs = formElement.querySelectorAll('[name]:not([disable])')
                    var enableInputs = formElement.querySelectorAll('[name]');

                    //vì formValues chưa có gì hết nên dùng reduce
                    //Chuyển nodeList thành Array, sau đó duyệt qua reduce để cộng dồn thành Object với key và value tương ứng
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        switch(input.type) {                           
                            case 'radio' :
                                //input checked ở đây bị trùng name nên nó sẽ bị ghi đè cái giá trị checked nếu tìm thấy
                                var isHasChecked = formElement.querySelector('input[name="'+ input.name +'"]:checked');
                                if(isHasChecked) {
                                    values[input.name] = isHasChecked.value;
                                }else{
                                    values[input.name] = ''
                                }
                                break;
                            case 'checkbox':
                                if( input.matches(':checked')) {
                                // console.log('tam tong ket khong checked',values)
                                if(!Array.isArray(values[input.name])) 
                                {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                
                                }else if(!values[input.name]) {
                                values[input.name] = []
                                }
                                // console.log('sau khi push',values)
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        // console.log('tong ket',values)
                        return values;
                    },{})
                    // console.log(formValues)
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
            }//Hơi dở nhưng để v cho có nhiều kiểu :)) đáng ra phải đổi ngược lại

            //còn ở đây sở dĩ muốn nó lặp qua hết để nó có thể ăn cái sự kiện oninput lên từng cái input một
            //Chỉ cần 1 cái input bất kỳ được checked sau khi báo lỗi submit (tức là đang oninput)
            //Thì nó sẽ thực hiện hàm oninput như dưới...
            var inputElements = formElement.querySelectorAll(rule.selector)

            if(inputElements) {
                Array.from(inputElements).forEach((inputElement) => {

                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector); // dùng chung cho mọi rules
                    var formGroup = getParent(inputElement, options.formGroupSelector);

                    //Xử lý trường hợp blur ra ngoài
                    inputElement.onblur = function() {
                        validate(inputElement, rule)
                    }
                    //Xử lý trường hợp nhập vào input
                    inputElement.oninput = function() {
                        errorElement.innerText = '';
                        formGroup.classList.remove(options.toggleClass)
                    }
                })
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
Validator.isRequired = function (selector, message) {
    return {
        selector : selector,
        test : function (value) {
            //Kiểm tra có nhập . tức value.trim() return ra True
            if(selector.includes('['))
                return value? undefined : message|| 'Vui lòng nhập trường này'
            else
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
