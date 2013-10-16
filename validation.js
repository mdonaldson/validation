( function ( exports ) {
	'use strict';

	// ## Validate multiple fields
	// Run all validations for all fields
	exports.validate = function( validations, validateObject ){
		var failedValidation = [];
		var keys             = Object.keys( validations );

		// run validation for each key in the validateObject
		for ( var i = keys.length; i--; ) {
			var validationType   = '';
			var fieldValue       = '';
			var fieldKey         = '';
			var valid            = false;
			var checkKeys        = keys[ i ].split( '.' );
			var fieldValidations = Object.keys( validations[ keys[ i ] ] );

			// validate for each validation type needed for this key
			for ( var x=fieldValidations.length; x--; ) {
				if ( checkKeys.length > 1 ) {

					// field to validate is in a dot notation ( nested key )
					if ( validateObject[ checkKeys[ 0 ] ] ) {
						fieldKey       = keys[ i ];
						fieldValue     = this.dotKeysToValue( validateObject, keys[ i ] );
						validationType = validations[ keys[ i ] ][ x ];
					}
				} else {
					fieldKey       = checkKeys[ 0 ];
					fieldValue     = validateObject[ checkKeys[ 0 ] ];
					validationType = validations[ checkKeys[ 0 ] ][ x ];
				}

				if ( fieldValue ) {

					// call the specific validation type function
					valid = this[ validationType ]( fieldValue );
					if ( !valid ) {
						var notValid          = {};
						notValid[ 'key' ]     = fieldKey;
						notValid[ 'value' ]   = fieldValue;
						notValid[ 'message' ] = fieldValue + ' is not a valid value for ' + fieldKey;

						// add the key and value that did not pass validation to the array of failures
						failedValidation.push( notValid );
					}
				}
			}
		}

		return failedValidation;
	};

	// This will format the error message returned from the failed validation
	exports.formatValidationErrors = function ( error ){
		var duplicatePattern = /.+dup key\:\s\{\s\:\s\"(.+)\".+/;
		var castErrorPattern = /^Cast/;
		var errorMessage     = '';

		if ( error.err ) {

			// This will check if a duplicate value for a unique field was attempted
			if ( duplicatePattern.test( error.err ) ) {
				// Format the error message
				errorMessage = error.err.replace( duplicatePattern, 'Duplicate Key - $1' );
			}

			// This will check if a value could not be cast to a different type
			if ( castErrorPattern.test( error.err ) ) {
				errorMessage = error.err;
			}

		} else if ( error.errmsg ) {

			// This will check if a duplicate value for a unique field was attempted
			if ( duplicatePattern.test( error.errmsg ) ) {

				// Format the error message
				errorMessage = error.errmsg.replace( duplicatePattern, 'Duplicate Key - $1' );
			}

			// This will check if a value could not be cast to a different type
			if ( castErrorPattern.test( error.errmsg ) ) {
				errorMessage = error.errmsg;
			}

		} else if ( error.path ) {

			// This will check if a value could not be cast to a different type
			if ( castErrorPattern.test( error.message ) ) {
				errorMessage = error.message;
			}

		} else if ( error.message && !error.path && !error.type ) {
			var parsedError = JSON.parse( error.message );

			// Display all validation errors
			if ( parsedError.length ) {

				// error is an array of failedValidations
				parsedError.forEach( function ( value, index ) {
					errorMessage = errorMessage + value.message + ', ';
				} );
				errorMessage = errorMessage.slice( 0, -2 );
			}

		} else if ( error.message && error.type ) {
			errorMessage = error.message;

		} else if ( error.length ) {

			// error is an array of failedValidations
			error.forEach( function ( value, index ) {
				errorMessage = errorMessage + value.message + ', ';
			} );
			errorMessage = errorMessage.slice( 0, -2 );
		}

		return errorMessage;

	};

	// Takes a dot notation string and returns the object value matching the nested key
	exports.dotKeysToValue = function ( obj, dotNotation ){
		var parts  = dotNotation.split( '.' );
		var newObj = obj[ parts[ 0 ] ];
		if ( parts[ 1 ] ) {
			parts.splice( 0, 1 );
			var newString = parts.join( '.' );
			return this.dotKeysToValue( newObj, newString );
		}

		return newObj;
	};

	// Takes a jquery ui object and returns an object with the values
	exports.uiToObjectValues = function ( obj, dotNotation ){
		var newObj  = {};
		var allKeys = Object.keys( obj );

		for ( var i = allKeys.length; i--; ) {
			newObj[ allKeys[ i ] ] = obj[ allKeys[ i ] ].val();
		}

		return newObj;
	};

	// ## Expected alphaNumeric Pattern
	//
	// [a-zA-Z\-0-9]+  -- at least one alphabetic or numeric character
	exports.alphaNumeric = function ( alphaNumericCheck ) {

		var alphaNumericPattern = /^[a-zA-Z\-0-9]+$/;

		return alphaNumericPattern.test( alphaNumericCheck );
	};

	// ## Expected alphabetic Pattern
	//
	// [a-zA-Z]+  -- at least one alphabetic character
	exports.alphabetic = function ( alphabeticCheck ) {

		var alphabeticPattern = /^([a-zA-Z])+$/;

		return alphabeticPattern.test( alphabeticCheck );
	};

	// ## Expected alphabetic Pattern
	//
	// ^([a-zA-Z]|\s)+$  -- at least one alphabetic character or space
	exports.alphabeticSpaces = function ( alphabeticSpacesCheck ) {

		var alphabeticSpacesPattern = /^([a-zA-Z]|\s)+$/;

		return alphabeticSpacesPattern.test( alphabeticSpacesCheck );
	};

	// ## Expected alphabetic Pattern
	//
	// ^([a-zA-Z]|\s)+$  -- at least one alphabetic character or space
	exports.alphabeticWithSeparators = function ( alphabeticWithSeparatorsCheck ) {

		var alphabeticWithSeparatorsPattern = /^([a-zA-Z\-\/]|\s)+$/;

		return alphabeticWithSeparatorsPattern.test( alphabeticWithSeparatorsCheck );
	};

	// ## Expected numeric Pattern
	//
	// [0-9]+ -- at least one numeric character
	exports.numeric = function ( numericCheck ) {

		var numericPattern = /^[0-9]+$/;

		return numericPattern.test( numericCheck );
	};

	// ## Expected dateTime Pattern
	//
	// isDate should be a valid date
	// Attempting to pass a NAN or a non numeric string will not create a date
	exports.dateTime = function ( dateTimeCheck ) {

		var isDate = new Date( dateTimeCheck ).getTime();

		return isDate;
	};

	// ## Expected boolean Pattern
	//
	// literal true or false
	exports.boolean = function ( booleanCheck ) {
		if ( booleanCheck === true || booleanCheck === false ) {

			return true;
		} else {

			return false;
		}

	};

	// ## Expected string length
	//
	// at least one character and up to 200
	exports.stringLength = function ( lengthCheck ) {
		var textPattern = /^((.)|(\s)){0,200}$/;

		return textPattern.test( lengthCheck );
	};

	// ## Expected email Pattern explanation
	//
	// [^<>()[\]\\.,;:\s@\"] -- characters that are not allowed ( <>, (), \, [, ], ., ;, :, ", space, comma, @ ) to begin a string
	//
	// (\.[^<>()[\]\\.,;:\s@\"]+)*) -- an optional dot followed by at least one character that is not in the list above
	//
	// (\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\]) -- a series of numbers separated by a dot and repeated four times (1.11.111.111)
	//
	// (([a-zA-Z\-0-9]+\.)+) at least one alphanumeric character followed by a dot
	//
	// [a-zA-Z]{2,} followed by at least two characters
	exports.email = function ( emailCheck ) {

		var emailPattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return emailPattern.test( emailCheck );
	};

	// ## Expected alphabetic Pattern
	//
	// [a-zA-Z]+  -- at least one alphabetic character
	exports.name = function ( alphabeticCheck ) {

		var alphabeticPattern = /^([a-zA-Z\'\-])+$/;

		return alphabeticPattern.test( alphabeticCheck );
	};

	// ## Expected alphaNumeric Pattern
	//
	// [a-zA-Z\-0-9]+  -- at least one alphabetic or numeric character
	exports.userName = function ( userNameCheck ) {

		var userNamePattern = /^[a-zA-Z\-\.\_\@0-9]+$/;

		return userNamePattern.test( userNameCheck );
	};

	// ## Expected phone Pattern explanation
	//
	// 10-12 digits
	exports.phone = function ( phoneCheck ) {

		var phonePattern = /^[0-9]{10,12}$/;

		return phonePattern.test( phoneCheck );
	};

	// ## Expected phone Pattern explanation
	//
	// 10-12 digits
	exports.phoneWithSeparators = function ( phoneCheck ) {

		var phonePattern = /^[0-9]{0,2}([\-\.]*)([\(]*)([0-9]{3})([\)]*)([\-\.]*)([0-9]{3})([\-\.]*)([0-9]{4})((\s)*([a-zA-Z\-0-9]){0,12})$/;

		return phonePattern.test( phoneCheck );
	};

	// ## Expected zipCode pattern explanation
	//
	// /(^\d{5}$)|(^\d{5}-\d{4}$)/ -- five numeric characters or five numeric characters followed by a dash and then four characters
	exports.zipCode = function ( zipCodeCheck ) {

		var zipCodePattern = /(^\d{5}$)|(^\d{5}-\d{4}$)/;

		return zipCodePattern.test( zipCodeCheck );
	};

	// ## Expected gender values
	//
	// male or female ( not case sensitive )
	exports.gender = function ( genderCheck ) {

		var genderPattern = /male|female/i;

		return genderPattern.test( genderCheck );
	};


} ) ( typeof exports === 'undefined' ? this[ 'validation' ] = {} : exports );