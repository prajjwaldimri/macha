#!/bin/bash

git subtree push --prefix frontend heroku-client master && git subtree push --prefix backend heroku-server master
