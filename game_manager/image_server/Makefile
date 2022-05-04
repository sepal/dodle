target := dodle-image-server
rolearn := "arn:aws:iam::646521904120:role/dodle-game-server"

function: zip
	@if aws lambda list-functions | grep $(target); then \
		aws lambda update-function-code --function-name $(target) --zip-file fileb://./tmp/$(target).zip; \
	else \
		aws lambda create-function --function-name "$(target)" --runtime go1.x --role $(rolearn) --handler $(target) --zip-file fileb://./tmp/$(target).zip; \
	fi

zip: compile
	cd tmp && zip $(target).zip $(target) && cd ..

compile:
	mkdir -p tmp; \
		GOOS=linux GOARCH=amd64 go build -o tmp/$(target)

clean:
	rm -rf tmp