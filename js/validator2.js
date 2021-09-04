function Validator2(formSelector, parentElement, errorElement,toggleClass) {
    var formRules = {}

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector))
                return element.parentElement;
            element = element.parentElement    
        }
    }

    /**
     * Quy ước Validate
     * 1 - Nếu sai thì trả ra `message lỗi`
     * 2 - Nếu đúng thì trả ra `undefined`
     */
    //Các hàm định nghĩa quy tắc cho các rules
    var validatorRules = {
        required(value) {
            return value ? undefined : 'Vui lòng nhập trường này!'
        },
        email(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email!'
        },
        min(min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
            }
        },
        max(max) {
            return function (value) {
                return value.length  <= max ? undefined : `Vui lòng chỉ nhập tối đa ${max} ký tự`
            }
        },
    }

    var formElement = document.querySelector(formSelector);

    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')

        //Lấy ra từng rules của input
        for (var input of inputs) {
            //Tách tưng cái rules của từng cái input ra thành chuỗi
            var rules = input.getAttribute('rules').split('|')

            for(var rule of rules) {
                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                //Tách tiếp lần 2 nếu có dấu ':'
                if(isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    
                    //Gán đè thằng rule
                    rule = ruleInfo[0]; //min()
                }  

                var ruleFunc = validatorRules[rule];

                if(isRuleHasValue) {
                    //Ghi đè lại cho nó mặc định là chạy luôn
                    //Tại hàm trong hàm nên sẽ hơi khó hiểu tí, không sao cả :3
                    //Nó vẫn trả lại hàm, tức là trả ra hợp lí
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if(!Array.isArray(formRules[input.name])) {
                    formRules[input.name] = []
                }

                formRules[input.name].push(ruleFunc)
            }

            //Lắng nghe sự kiện để validate (blur,input,...)
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        //Hàm thực hiện validate
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;

           rules.some((rule)=> {
                errorMessage = rule(event.target.value)
                return errorMessage;
            });

            if(errorMessage) {
                var formGroup = getParent(event.target, parentElement)
                if(formGroup) {
                    formGroup.classList.add(toggleClass)
                    var formMessage = formGroup.querySelector(errorElement)
                    if(formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            }
        }

        //Hàm clear message lỗi
        function handleClearError(event) {
            var formGroup = getParent(event.target, parentElement)
            if(formGroup.classList.contains(toggleClass)) {
                formGroup.classList.remove(toggleClass)

                var formMessage = formGroup.querySelector(errorElement)
                if(formMessage) {
                    formMessage.innerText = '';
                }
            }
        }
        // console.log(formRules)
    }
}