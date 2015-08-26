var helloApp = angular.module("helloApp", []);
helloApp.controller("CompanyCtrl", function ($scope) {
    $scope.companies = [
        {'name': 'Infosys Technologies',
            'employees': 125000,
            'headoffice': 'Bangalore'},
        {'name': 'Cognizant Technologies',
            'employees': 100000,
            'headoffice': 'Bangalore'},
        {'name': 'Wipro',
            'employees': 115000,
            'headoffice': 'Bangalore'},
        {'name': 'Tata Consultancy Services (TCS)',
            'employees': 150000,
            'headoffice': 'Bangalore'},
        {'name': 'HCL Technologies',
            'employees': 90000,
            'headoffice': 'Noida'},
    ];
    $scope.addRow = function () {
        $scope.companies.push({'name': $scope.name, 'employees': $scope.employees, 'headoffice': $scope.headoffice});
        $scope.name = '';
        $scope.employees = '';
        $scope.headoffice = '';
    };
});
