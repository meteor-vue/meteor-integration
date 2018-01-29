import {ClassyTestCase} from 'meteor/peerlibrary:classy-test';

class BasicTestCase extends ClassyTestCase {
  testClientBasic() {
    import Vue from 'vue';

    const div = document.createElement('div');
    document.body.appendChild(div);

    new Vue({
      el: div,
      render: (createElement) => {
        return createElement('test-parent');
      },
    });
  }
}

BasicTestCase.testName = 'vue-meteor-integration - basic';

ClassyTestCase.addTest(new BasicTestCase());
