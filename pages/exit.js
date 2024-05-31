import React, { useState } from 'react';
import AppContainer from '../components/AppContainer';
import { UserProvider } from '../providers/UserProvider';

function VoluntaryExit() {
  const [files, setFiles] = useState([]);
  const [validators, setValidators] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [isConfirmButtonActive, setIsConfirmButtonActive] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState(false);
  const [timer, setTimer] = useState(5);
  const [failedBroadcasts, setFailedBroadcasts] = useState([]);

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const jsonFiles = [];
    const parsedValidators = [];
    let allFilesValid = true;

    uploadedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedJson = JSON.parse(e.target.result);
          if (validateVoluntaryExitJson(parsedJson)) {
            jsonFiles.push(file.name);
            parsedValidators.push({
              index: parsedJson.message.validator_index,
              publicKey: parsedJson.signature, // Assuming the signature is used as a placeholder for the public key
            });
            setUploadError(false);
          } else {
            allFilesValid = false;
            setUploadError(true);
            setUploadMessage(`Invalid Voluntary Exit JSON in file: ${file.name}`);
            setShowUploadModal(true);
          }
        } catch (error) {
          allFilesValid = false;
          setUploadError(true);
          setUploadMessage(`Failed to parse JSON in file: ${file.name}`);
          setShowUploadModal(true);
        }
        if (index === uploadedFiles.length - 1 && allFilesValid) {
          setUploadMessage(`Successfully uploaded ${parsedValidators.length} validator${parsedValidators.length > 1 ? 's' : ''}.`);
          setValidators(parsedValidators);
          setUploadError(false);
          setShowUploadModal(true);
        }
      };
      reader.readAsText(file);
    });

    setFiles(uploadedFiles);
  };

  const validateVoluntaryExitJson = (json) => {
    const hasMessage = json.hasOwnProperty('message');
    const hasSignature = json.hasOwnProperty('signature');
    if (!hasMessage || !hasSignature) {
      return false;
    }

    const { message } = json;
    const hasEpoch = message.hasOwnProperty('epoch');
    const hasValidatorIndex = message.hasOwnProperty('validator_index');
    return hasEpoch && hasValidatorIndex;
  };

  const truncatePublicKey = (publicKey) => {
    return publicKey.length > 10 ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : publicKey;
  };

  const handleBroadcastExits = () => {
    setShowConfirmModal(true);
    setIsConfirmButtonActive(false);
    setTimer(5);
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          clearInterval(countdown);
          setIsConfirmButtonActive(true);
          return prevTimer - 1;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleConfirmBroadcast = async () => {
    setShowConfirmModal(false);

    const broadcastPromises = files.map((file) => {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const parsedJson = JSON.parse(e.target.result);
            const response = await fetch('https://ethereum-beacon-api.publicnode.com/eth/v1/beacon/pool/voluntary_exits', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(parsedJson),
            });

            if (response.ok) {
              resolve({ success: true, file: file.name });
            } else {
              const errorData = await response.json();
              resolve({ success: false, file: file.name, error: errorData.error.message });
            }
          } catch (error) {
            resolve({ success: false, file: file.name, error: error.message });
          }
        };
        reader.readAsText(file);
      });
    });

    const results = await Promise.all(broadcastPromises);

    const successfulExits = results.filter(result => result.success).length;
    const failedExits = results.filter(result => !result.success);

    if (successfulExits > 0) {
      setUploadMessage(`Successfully broadcasted ${successfulExits} exit${successfulExits > 1 ? 's' : ''}.`);
      setShowSuccessModal(true);
    }

    if (failedExits.length > 0) {
      setFailedBroadcasts(failedExits);
      setShowFailedModal(true);
    }
  };

  return (
    <UserProvider>
      <AppContainer>
        <div className="m-10 bg-white rounded-md p-10 shadow-md">
          <div>
            <h2 className='text-3xl py-5 flex'>Broadcast Voluntary Exits</h2>
            <p>This feature broadcast exit messages to the Ethereum network. You can reference how long of a wait there is for funds to release at <a className="text-blue-600" href="https://www.validatorqueue.com/" target="_blank" rel="noreferrer"> this link.</a></p>
            <header className="pb-4 pt-6 sm:pb-6 flex justify-between">
              <div className="flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
              </div>
            </header>
            <div className="relative isolate overflow-hidden">
              <div className="flex flex-col items-center justify-center py-2">
                <input
                  type="file"
                  multiple
                  accept=".json"
                  onChange={handleFileUpload}
                  className="mb-4 p-2 border rounded"
                />
              </div>
            </div>
          </div>

          {validators.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4">Validators</h2>
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Validator Index</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Public Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {validators.map((validator, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl0">{validator.index}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{truncatePublicKey(validator.publicKey)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  onClick={handleBroadcastExits}
                >
                  Broadcast Exit{validators.length > 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}
        </div>

        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium">Confirm Broadcast</h3>
              <p className="mt-2 text-sm text-gray-500">Are you sure you want to broadcast the exits?</p>
              <div className="mt-4 flex justify-end">
                <button
                  className={`px-4 py-2 mr-2 bg-gray-300 rounded-md ${!isConfirmButtonActive ? 'cursor-not-allowed' : ''}`}
                  disabled={!isConfirmButtonActive}
                  onClick={handleConfirmBroadcast}
                >
                  Confirm{!isConfirmButtonActive && ` (${timer})`}
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium">Success</h3>
              <p className="mt-2 text-sm text-gray-500">Exits have been successfully broadcasted!</p>
              <div className="mt-4 flex justify-end">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md"
                  onClick={() => setShowSuccessModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {showFailedModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium">Failed Broadcasts</h3>
              <p className="mt-2 text-sm text-gray-500">The following broadcasts failed:</p>
              <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
                {failedBroadcasts.map((result, index) => (
                  <li key={index}>{result.file}: {result.error}</li>
                ))}
              </ul>
              <div className="mt-4 flex justify-end">
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                  onClick={() => setShowFailedModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium">{uploadError ? 'Error' : 'Success'}</h3>
              <p className="mt-2 text-sm text-gray-500">{uploadMessage}</p>
              <div className="mt-4 flex justify-end">
                <button
                  className={`px-4 py-2 ${uploadError ? 'bg-red-600' : 'bg-green-600'} text-white rounded-md`}
                  onClick={() => setShowUploadModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </AppContainer>
    </UserProvider>
  );
}

export default VoluntaryExit;
